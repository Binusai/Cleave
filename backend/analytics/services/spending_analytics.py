from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta, date
from expenses.models import Expense, ExpenseCategory


def get_date_range_filter(days):
    end = timezone.now().date()
    start = end - timedelta(days=days)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=days)
    return start, end, prev_start, prev_end


def get_overview(user, group_id=None, days=30):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    if group_id:
        group_ids = group_ids.filter(id=group_id)

    start, end, prev_start, prev_end = get_date_range_filter(days)

    current_expenses = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=start, expense_date__lte=end
    )
    previous_expenses = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=prev_start, expense_date__lte=prev_end
    )

    total_spent = float(current_expenses.aggregate(total=Sum('amount'))['total'] or 0)
    prev_total_spent = float(previous_expenses.aggregate(total=Sum('amount'))['total'] or 0)
    total_count = current_expenses.count()
    prev_count = previous_expenses.count()
    avg_per_day = round(total_spent / days, 2) if days > 0 else 0
    prev_avg_per_day = round(prev_total_spent / days, 2) if days > 0 else 0

    spending_change = round(((total_spent - prev_total_spent) / prev_total_spent * 100), 1) if prev_total_spent > 0 else 0
    count_change = total_count - prev_count
    avg_change = round(((avg_per_day - prev_avg_per_day) / prev_avg_per_day * 100), 1) if prev_avg_per_day > 0 else 0

    top_category = current_expenses.values('category__name', 'category__color').annotate(
        total=Sum('amount')
    ).order_by('-total').first()

    active_groups = Group.objects.filter(
        id__in=group_ids, is_active=True
    ).filter(expenses__is_deleted=False, expenses__expense_date__gte=start).distinct().count()

    return {
        'total_spent': total_spent,
        'prev_total_spent': prev_total_spent,
        'spending_change': spending_change,
        'avg_per_day': avg_per_day,
        'prev_avg_per_day': prev_avg_per_day,
        'avg_change': avg_change,
        'total_expenses': total_count,
        'count_change': count_change,
        'active_groups': active_groups,
        'top_category': top_category['category__name'] if top_category else 'N/A',
        'top_category_color': top_category['category__color'] if top_category else '#64748B',
        'top_category_percent': round(
            (top_category['total'] / total_spent * 100), 1
        ) if top_category and total_spent > 0 else 0,
    }


def get_spending_trends(user, group_id=None, period='monthly', months=12):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    if group_id:
        group_ids = group_ids.filter(id=group_id)

    end = timezone.now().date()
    start = end - timedelta(days=months * 31)

    expenses = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False,
        expense_date__gte=start, expense_date__lte=end
    )

    if period == 'daily':
        data = expenses.extra(select={'day': "DATE(expense_date)"}).values('day').annotate(
            total=Sum('amount')
        ).order_by('day')
        return [{'label': d['day'].strftime('%d %b') if hasattr(d['day'], 'strftime') else str(d['day']),
                 'total': float(d['total'])} for d in data]

    elif period == 'weekly':
        from django.db.models.functions import TruncWeek
        data = expenses.annotate(week=TruncWeek('expense_date')).values('week').annotate(
            total=Sum('amount')
        ).order_by('week')
        return [{'label': d['week'].strftime('%d %b') if d['week'] else '', 'total': float(d['total'])} for d in data]

    else:
        from django.db.models.functions import TruncMonth
        data = expenses.annotate(month=TruncMonth('expense_date')).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')
        return [{'label': d['month'].strftime('%b %Y') if d['month'] else '', 'total': float(d['total'])} for d in data]


def get_category_breakdown(user, group_id=None, days=30):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    if group_id:
        group_ids = group_ids.filter(id=group_id)

    start, end, _, _ = get_date_range_filter(days)

    categories = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False,
        expense_date__gte=start, expense_date__lte=end
    ).values('category__name', 'category__color').annotate(
        total=Sum('amount'), count=Count('id')
    ).order_by('-total')

    total = sum(float(c['total']) for c in categories) or 1

    return [{
        'category': c['category__name'] or 'Uncategorized',
        'color': c['category__color'] or '#64748B',
        'total': float(c['total']),
        'count': c['count'],
        'percent': round(float(c['total']) / total * 100, 1),
    } for c in categories]


def get_expense_patterns(user, group_id=None, days=90):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    if group_id:
        group_ids = group_ids.filter(id=group_id)

    start, end, _, _ = get_date_range_filter(days)

    expenses = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, expense_date__gte=start, expense_date__lte=end
    )

    total_spent = float(expenses.aggregate(total=Sum('amount'))['total'] or 0)
    count = expenses.count()
    avg_expense = round(total_spent / count, 2) if count > 0 else 0

    largest = expenses.order_by('-amount').first()
    most_expensive_day = expenses.values('expense_date').annotate(
        daily_total=Sum('amount')
    ).order_by('-daily_total').first()

    return {
        'avg_expense_value': avg_expense,
        'largest_expense': float(largest.amount) if largest else 0,
        'largest_expense_title': largest.title if largest else '',
        'largest_expense_group': largest.group.name if largest else '',
        'most_expensive_day': most_expensive_day['expense_date'].isoformat() if most_expensive_day else None,
        'most_expensive_day_amount': float(most_expensive_day['daily_total']) if most_expensive_day else 0,
        'total_expenses_count': count,
    }