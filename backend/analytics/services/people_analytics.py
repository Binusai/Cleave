from django.db.models import Sum, Count
from django.contrib.auth import get_user_model
from expenses.models import Expense, ExpenseSplit
from settlements.models import Settlement

User = get_user_model()


def get_people_analytics(user, days=90):
    from groups.models import Group, GroupMembership
    from django.utils import timezone
    from datetime import timedelta

    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    start = timezone.now().date() - timedelta(days=days)

    memberships = GroupMembership.objects.filter(
        group_id__in=group_ids, status='active'
    ).exclude(user=user).select_related('user')

    people_data = []
    seen = set()

    for membership in memberships:
        member = membership.user
        if member.id in seen:
            continue
        seen.add(member.id)

        paid_expenses = Expense.objects.filter(
            group_id__in=group_ids, is_deleted=False,
            paid_by=member, expense_date__gte=start
        )
        total_paid = float(paid_expenses.aggregate(total=Sum('amount'))['total'] or 0)
        expense_count = paid_expenses.count()

        splits_participated = ExpenseSplit.objects.filter(
            user=member, expense__group_id__in=group_ids,
            expense__is_deleted=False, expense__expense_date__gte=start
        ).count()

        settlements_completed = Settlement.objects.filter(
            group_id__in=group_ids, status='completed'
        ).filter(
            models.Q(payer=member) | models.Q(payee=member)
        ).count()

        people_data.append({
            'user_id': member.id,
            'name': member.get_full_name() or member.email.split('@')[0],
            'email': member.email,
            'total_paid': total_paid,
            'expense_count': expense_count,
            'splits_participated': splits_participated,
            'settlements_completed': settlements_completed,
        })

    people_data.sort(key=lambda x: x['total_paid'], reverse=True)

    total_all = sum(p['total_paid'] for p in people_data) or 1
    for p in people_data:
        p['contribution_percent'] = round(p['total_paid'] / total_all * 100, 1)

    return people_data


import django.db.models as models