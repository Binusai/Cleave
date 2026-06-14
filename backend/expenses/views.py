from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from notifications.services import notify_expense_added

from .models import Expense, ExpenseCategory
from .serializers import (
    ExpenseSerializer,
    ExpenseCreateSerializer,
    ExpenseCategorySerializer,
)
from .services import calculate_splits, save_expense_splits, recalculate_group_balances
from groups.models import Group, GroupMembership


class IsGroupMemberForExpense(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        group_id = view.kwargs.get('group_id')
        if not group_id:
            return True
        return GroupMembership.objects.filter(
            user=request.user, group_id=group_id, status='active'
        ).exists()


@method_decorator(csrf_exempt, name='dispatch')
class GroupExpenseListView(APIView):
    permission_classes = [IsGroupMemberForExpense]

    def get(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id, is_active=True)
        expenses = Expense.objects.filter(
            group=group, is_deleted=False
        ).prefetch_related('splits__user').select_related('paid_by', 'category')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id, is_active=True)
        serializer = ExpenseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        expense = Expense.objects.create(
            group=group,
            title=data['title'],
            description=data.get('description', ''),
            category_id=data.get('category_id'),
            amount=data['amount'],
            paid_by_id=data['paid_by'],
            split_type=data['split_type'],
            expense_date=data['expense_date'],
            notes=data.get('notes', ''),
            created_by=request.user,
        )

        splits_data = calculate_splits(expense, data['split_type'], data['participants'])
        save_expense_splits(expense, splits_data)
        recalculate_group_balances(group)
        notify_expense_added(expense, group)
        
        return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)
    
    


@method_decorator(csrf_exempt, name='dispatch')
class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Expense, pk=pk, is_deleted=False)

    def get(self, request, pk):
        expense = self.get_object(pk)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(pk)
        serializer = ExpenseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        expense.title = data['title']
        expense.description = data.get('description', '')
        expense.category_id = data.get('category_id')
        expense.amount = data['amount']
        expense.paid_by_id = data['paid_by']
        expense.split_type = data['split_type']
        expense.expense_date = data['expense_date']
        expense.notes = data.get('notes', '')
        expense.save()

        splits_data = calculate_splits(expense, data['split_type'], data['participants'])
        save_expense_splits(expense, splits_data)
        recalculate_group_balances(expense.group)

        return Response(ExpenseSerializer(expense).data)

    def delete(self, request, pk):
        expense = self.get_object(pk)
        expense.delete(soft=True, deleted_by=request.user)
        recalculate_group_balances(expense.group)
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = ExpenseCategory.objects.all()
        serializer = ExpenseCategorySerializer(categories, many=True)
        return Response(serializer.data)