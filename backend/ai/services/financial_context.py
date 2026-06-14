from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from groups.models import Group, GroupMembership
from expenses.models import Expense, ExpenseSplit, ExpenseCategory, Balance
from settlements.models import Settlement
from analytics.services.financial_health import get_financial_health
from expenses.services import get_user_total_owed, get_user_total_owed_to


def build_financial_context(user):
    now = timezone.now()
    start_of_month = now.replace(day=1)
    start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
    start_90_days = now.date() - timedelta(days=90)

    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    total_expenses_this_month = float(
        Expense.objects.filter(group_id__in=group_ids, is_deleted=False, expense_date__gte=start_of_month.date())
        .aggregate(total=Sum('amount'))['total'] or 0
    )
    total_expenses_last_month = float(
        Expense.objects.filter(group_id__in=group_ids, is_deleted=False,
                               expense_date__gte=start_of_last_month.date(),
                               expense_date__lt=start_of_month.date())
        .aggregate(total=Sum('amount'))['total'] or 0
    )

    spending_change = round(
        ((total_expenses_this_month - total_expenses_last_month) / total_expenses_last_month * 100), 1
    ) if total_expenses_last_month > 0 else 0

    top_category = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=start_of_month.date()
    ).values('category__name').annotate(total=Sum('amount')).order_by('-total').first()

    you_owe = get_user_total_owed(user)
    you_are_owed = get_user_total_owed_to(user)
    net_balance = you_are_owed - you_owe

    pending_settlements = Settlement.objects.filter(
        group_id__in=group_ids, status='pending'
    ).filter(Q(payer=user) | Q(payee=user))

    pending_owe = float(pending_settlements.filter(payer=user).aggregate(total=Sum('amount'))['total'] or 0)
    pending_owed = float(pending_settlements.filter(payee=user).aggregate(total=Sum('amount'))['total'] or 0)

    total_settlements = Settlement.objects.filter(
        group_id__in=group_ids
    ).filter(Q(payer=user) | Q(payee=user)).count()

    completed_settlements = Settlement.objects.filter(
        group_id__in=group_ids, status='completed'
    ).filter(Q(payer=user) | Q(payee=user)).count()

    settlement_rate = round((completed_settlements / total_settlements * 100), 1) if total_settlements > 0 else 100

    health = get_financial_health(user)

    groups = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).annotate(
        total_spent=Sum('expenses__amount', filter=Q(expenses__is_deleted=False))
    ).order_by('-total_spent')

    top_groups = [{'name': g.name, 'total_spent': float(g.total_spent or 0), 'member_count': g.member_count}
                  for g in groups[:5]]

    top_payers = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=start_90_days
    ).values('paid_by__first_name', 'paid_by__email').annotate(
        total=Sum('amount'), count=Count('id')
    ).order_by('-total')[:5]

    top_people = [{
        'name': p['paid_by__first_name'] or p['paid_by__email'].split('@')[0],
        'total_paid': float(p['total']),
        'expense_count': p['count']
    } for p in top_payers]

    category_breakdown = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=start_90_days
    ).values('category__name', 'category__color').annotate(
        total=Sum('amount'), count=Count('id')
    ).order_by('-total')

    total_cat = sum(float(c['total']) for c in category_breakdown) or 1
    categories = [{
        'name': c['category__name'] or 'Uncategorized',
        'color': c['category__color'] or '#64748B',
        'total': float(c['total']),
        'count': c['count'],
        'percent': round(float(c['total']) / total_cat * 100, 1)
    } for c in category_breakdown]

    return {
        'user': {
            'name': user.get_full_name() or user.email.split('@')[0],
            'email': user.email,
            'member_since': user.date_joined.strftime('%B %Y'),
        },
        'financial_summary': {
            'total_expenses_this_month': total_expenses_this_month,
            'total_expenses_last_month': total_expenses_last_month,
            'spending_change_percent': spending_change,
            'top_category': top_category['category__name'] if top_category else 'N/A',
            'you_owe': you_owe,
            'you_are_owed': you_are_owed,
            'net_balance': net_balance,
            'pending_owe': pending_owe,
            'pending_owed': pending_owed,
            'settlement_rate': settlement_rate,
        },
        'health': health,
        'top_groups': top_groups,
        'top_people': top_people,
        'categories': categories,
        'active_groups_count': len(groups),
        'pending_settlements_count': pending_settlements.count(),
    }