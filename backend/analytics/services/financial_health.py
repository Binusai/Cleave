from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from expenses.models import Expense
from settlements.models import Settlement


def get_financial_health(user):
    from groups.models import Group

    group_ids = Group.objects.filter(
        memberships__user=user, memberships__status='active', is_active=True
    ).values_list('id', flat=True)

    end = timezone.now().date()
    start_90 = end - timedelta(days=90)

    settlements = Settlement.objects.filter(
        group_id__in=group_ids
    ).filter(Q(payer=user) | Q(payee=user))

    total_settlements = settlements.count()
    completed_settlements = settlements.filter(status='completed').count()
    pending_settlements = settlements.filter(status='pending').count()

    settlement_discipline = round(
        (completed_settlements / total_settlements * 100), 1
    ) if total_settlements > 0 else 100

    expenses = Expense.objects.filter(
        group_id__in=group_ids, is_deleted=False, created_by=user
    )
    total_expenses_tracked = expenses.count()
    expenses_last_90 = expenses.filter(expense_date__gte=start_90).count()

    days_with_expenses = expenses.filter(
        expense_date__gte=start_90
    ).dates('expense_date', 'day').count()

    consistency = round((days_with_expenses / 90 * 100), 1) if days_with_expenses > 0 else 0

    groups_created = Group.objects.filter(created_by=user, is_active=True).count()
    groups_managed = Group.objects.filter(
        memberships__user=user, memberships__status='active', memberships__role__in=['owner', 'admin']
    ).count()

    organizer_score = round((groups_managed / max(groups_created, 1) * 100), 1) if groups_created > 0 else 0

    health_score = round(
        (settlement_discipline * 0.45) +
        (consistency * 0.30) +
        (min(organizer_score, 100) * 0.25)
    , 1)

    def get_health_label(score):
        if score >= 80:
            return 'Excellent'
        if score >= 60:
            return 'Good'
        if score >= 40:
            return 'Fair'
        return 'Needs Attention'

    def get_health_color(score):
        if score >= 80:
            return '#16A34A'
        if score >= 60:
            return '#F59E0B'
        return '#DC2626'

    return {
        'health_score': health_score,
        'health_label': get_health_label(health_score),
        'health_color': get_health_color(health_score),
        'settlement_discipline': settlement_discipline,
        'consistency': consistency,
        'organizer_score': organizer_score,
        'total_expenses_tracked': total_expenses_tracked,
        'completed_settlements': completed_settlements,
        'pending_settlements': pending_settlements,
        'groups_created': groups_created,
        'groups_managed': groups_managed,
        'spending_streak_days': days_with_expenses,
    }