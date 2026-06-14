from django.db.models import Sum, Q, Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta

from groups.models import Group, GroupMembership
from groups.permissions import IsGroupMember
from expenses.models import Expense
from expenses.services import get_user_total_owed, get_user_total_owed_to
from settlements.models import Settlement


@method_decorator(csrf_exempt, name='dispatch')
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        start_of_month = now.replace(day=1)
        last_month_start = (start_of_month - timedelta(days=1)).replace(day=1)

        user_groups = Group.objects.filter(
            memberships__user=user,
            memberships__status='active',
            is_active=True
        )
        group_ids = user_groups.values_list('id', flat=True)

        you_owe = get_user_total_owed(user)
        you_are_owed = get_user_total_owed_to(user)

        this_month_expenses = Expense.objects.filter(
            group_id__in=group_ids,
            is_deleted=False,
            expense_date__gte=start_of_month.date()
        ).aggregate(total=Sum('amount'))['total'] or 0

        last_month_expenses = Expense.objects.filter(
            group_id__in=group_ids,
            is_deleted=False,
            expense_date__gte=last_month_start.date(),
            expense_date__lt=start_of_month.date()
        ).aggregate(total=Sum('amount'))['total'] or 0

        spending_trend = 0
        if float(last_month_expenses) > 0:
            spending_trend = ((float(this_month_expenses) - float(last_month_expenses)) / float(last_month_expenses)) * 100

        pending_settlements = Settlement.objects.filter(
            Q(payer=user) | Q(payee=user),
            status='pending',
            group_id__in=group_ids
        ).count()

        total_settlements = Settlement.objects.filter(
            Q(payer=user) | Q(payee=user),
            group_id__in=group_ids
        ).count()

        settlement_rate = 0
        if total_settlements > 0:
            completed = Settlement.objects.filter(
                Q(payer=user) | Q(payee=user),
                status='completed',
                group_id__in=group_ids
            ).count()
            settlement_rate = (completed / total_settlements) * 100

        return Response({
            'you_owe': float(you_owe),
            'you_are_owed': float(you_are_owed),
            'net_balance': float(you_are_owed) - float(you_owe),
            'active_groups': user_groups.count(),
            'total_expenses_this_month': float(this_month_expenses),
            'pending_settlements': pending_settlements,
            'settlement_completion_rate': round(settlement_rate, 1),
            'monthly_spending_trend': round(spending_trend, 1),
        })


@method_decorator(csrf_exempt, name='dispatch')
class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group_ids = Group.objects.filter(
            memberships__user=user,
            memberships__status='active'
        ).values_list('id', flat=True)

        activities = []

        recent_expenses = Expense.objects.filter(
            group_id__in=group_ids,
            is_deleted=False
        ).select_related('paid_by', 'group').order_by('-created_at')[:10]

        for expense in recent_expenses:
            activities.append({
                'type': 'expense',
                'id': expense.id,
                'title': expense.title,
                'amount': float(expense.amount),
                'group_name': expense.group.name,
                'paid_by': expense.paid_by.get_full_name() if expense.paid_by else '',
                'date': expense.created_at.isoformat(),
            })

        recent_settlements = Settlement.objects.filter(
            Q(payer=user) | Q(payee=user),
            group_id__in=group_ids
        ).select_related('payer', 'payee', 'group').order_by('-created_at')[:10]

        for settlement in recent_settlements:
            activities.append({
                'type': 'settlement',
                'id': settlement.id,
                'amount': float(settlement.amount),
                'group_name': settlement.group.name,
                'payer': settlement.payer.get_full_name(),
                'payee': settlement.payee.get_full_name(),
                'status': settlement.status,
                'date': settlement.created_at.isoformat(),
            })

        activities.sort(key=lambda x: x['date'], reverse=True)

        return Response(activities[:15])


@method_decorator(csrf_exempt, name='dispatch')
class DashboardGroupBalancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = Group.objects.filter(
            memberships__user=user,
            memberships__status='active',
            is_active=True
        )

        group_data = []
        for group in groups:
            from expenses.models import Balance
            owes = float(Balance.objects.filter(group=group, debtor=user).aggregate(
                total=Sum('amount'))['total'] or 0)
            owed = float(Balance.objects.filter(group=group, creditor=user).aggregate(
                total=Sum('amount'))['total'] or 0)

            group_data.append({
                'id': group.id,
                'name': group.name,
                'member_count': group.member_count,
                'total_expenses': float(group.total_expenses),
                'you_owe': owes,
                'you_are_owed': owed,
                'balance': owed - owes,
                'last_activity': group.updated_at.isoformat(),
                'image': group.image.url if group.image else None,
            })

        return Response(group_data)


@method_decorator(csrf_exempt, name='dispatch')
class MonthlySpendingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group_ids = Group.objects.filter(
            memberships__user=user,
            memberships__status='active'
        ).values_list('id', flat=True)

        monthly = Expense.objects.filter(
            group_id__in=group_ids,
            is_deleted=False,
            expense_date__gte=timezone.now().date() - timedelta(days=365)
        ).annotate(
            month=TruncMonth('expense_date')
        ).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')

        return Response([
            {'month': item['month'].strftime('%b %Y'), 'total': float(item['total'])}
            for item in monthly
        ])


@method_decorator(csrf_exempt, name='dispatch')
class CategoryBreakdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group_ids = Group.objects.filter(
            memberships__user=user,
            memberships__status='active'
        ).values_list('id', flat=True)

        categories = Expense.objects.filter(
            group_id__in=group_ids,
            is_deleted=False
        ).values('category__name', 'category__color').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        return Response([
            {
                'category': item['category__name'] or 'Uncategorized',
                'color': item['category__color'] or '#64748B',
                'total': float(item['total']),
                'count': item['count'],
            }
            for item in categories
        ])