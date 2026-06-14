from django.db.models import Sum, Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import UserPreferences
from .serializers import UserPreferencesSerializer

from expenses.models import Expense
from settlements.models import Settlement
from groups.models import Group
from expenses.services import get_user_total_owed, get_user_total_owed_to
from analytics.services.financial_health import get_financial_health
from .serializers import UserProfileSerializer, ProfileUpdateSerializer


@method_decorator(csrf_exempt, name='dispatch')
class ProfileOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group_ids = Group.objects.filter(
            memberships__user=user, memberships__status='active', is_active=True
        ).values_list('id', flat=True)

        total_expenses = Expense.objects.filter(
            group_id__in=group_ids, is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_expenses_count = Expense.objects.filter(
            group_id__in=group_ids, is_deleted=False
        ).count()

        active_groups = Group.objects.filter(
            memberships__user=user, memberships__status='active', is_active=True
        ).count()

        total_settled = Settlement.objects.filter(
            Q(payer=user) | Q(payee=user),
            status='completed',
            group_id__in=group_ids
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_settlements_count = Settlement.objects.filter(
            Q(payer=user) | Q(payee=user),
            status='completed',
            group_id__in=group_ids
        ).count()

        health = get_financial_health(user)

        return Response({
            'user': UserProfileSerializer(user).data,
            'total_expenses': float(total_expenses),
            'total_expenses_count': total_expenses_count,
            'active_groups': active_groups,
            'total_settled': float(total_settled),
            'total_settlements_count': total_settlements_count,
            'you_owe': get_user_total_owed(user),
            'you_are_owed': get_user_total_owed_to(user),
            'net_balance': get_user_total_owed_to(user) - get_user_total_owed(user),
            'financial_health': health,
        })


@method_decorator(csrf_exempt, name='dispatch')
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = request.user

        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone_number' in data:
            user.phone_number = data['phone_number'] or None

        user.save()

        return Response(UserProfileSerializer(user).data)


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Both passwords are required'}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password changed successfully'})


@method_decorator(csrf_exempt, name='dispatch')
class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active = False
        user.save()
        return Response({'message': 'Account deactivated'})
    
@method_decorator(csrf_exempt, name='dispatch')
class PreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(prefs)
        return Response(serializer.data)

    def put(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(prefs, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)