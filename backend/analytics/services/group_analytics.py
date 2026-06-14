from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from groups.models import Group
from expenses.models import Expense
from settlements.models import Settlement


def get_group_analytics(user, days=30):
    groups = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    )
    start = timezone.now().date() - timedelta(days=days)

    group_data = []
    for group in groups:
        expenses = Expense.objects.filter(group=group, is_deleted=False, expense_date__gte=start)
        total_spent = float(expenses.aggregate(total=Sum('amount'))['total'] or 0)
        expense_count = expenses.count()

        total_settlements = Settlement.objects.filter(group=group).count()
        completed_settlements = Settlement.objects.filter(group=group, status='completed').count()
        settlement_rate = round(
            (completed_settlements / total_settlements * 100), 1
        ) if total_settlements > 0 else 0

        group_data.append({
            'id': group.id,
            'name': group.name,
            'member_count': group.member_count,
            'total_spent': total_spent,
            'expense_count': expense_count,
            'settlement_rate': settlement_rate,
            'avg_per_expense': round(total_spent / expense_count, 2) if expense_count > 0 else 0,
        })

    group_data.sort(key=lambda x: x['total_spent'], reverse=True)
    return group_data


def get_top_groups(user, limit=5):
    return get_group_analytics(user)[:limit]