from django.db.models import Sum, Q
from django.utils import timezone
from .models import Settlement
from expenses.models import Balance


def generate_settlements_from_balances(group):
    balances = Balance.objects.filter(group=group, amount__gt=0.01)
    created = 0

    for balance in balances:
        existing = Settlement.objects.filter(
            group=group,
            payer=balance.debtor,
            payee=balance.creditor,
            status='pending'
        ).first()

        if not existing:
            Settlement.objects.create(
                group=group,
                payer=balance.debtor,
                payee=balance.creditor,
                amount=balance.amount,
                status='pending'
            )
            created += 1

    Settlement.objects.filter(
        group=group,
        status='pending'
    ).exclude(
        Q(payer__in=balances.values('debtor')) | Q(payee__in=balances.values('creditor'))
    ).update(status='cancelled')

    return created


def get_settlement_summary(user):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user,
        memberships__status='active',
        is_active=True
    ).values_list('id', flat=True)

    you_owe = Settlement.objects.filter(
        group_id__in=group_ids,
        payer=user,
        status='pending'
    ).aggregate(total=Sum('amount'))['total'] or 0

    you_are_owed = Settlement.objects.filter(
        group_id__in=group_ids,
        payee=user,
        status='pending'
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_pending = Settlement.objects.filter(
        group_id__in=group_ids,
        status='pending'
    ).filter(Q(payer=user) | Q(payee=user)).count()

    total_completed = Settlement.objects.filter(
        group_id__in=group_ids,
        status='completed'
    ).filter(Q(payer=user) | Q(payee=user)).count()

    total_all = total_pending + total_completed
    settlement_rate = (total_completed / total_all * 100) if total_all > 0 else 0

    you_owe_count = Settlement.objects.filter(
        group_id__in=group_ids, payer=user, status='pending'
    ).values('payee').distinct().count()

    you_are_owed_count = Settlement.objects.filter(
        group_id__in=group_ids, payee=user, status='pending'
    ).values('payer').distinct().count()

    return {
        'you_owe': float(you_owe),
        'you_are_owed': float(you_are_owed),
        'net_balance': float(you_are_owed) - float(you_owe),
        'you_owe_count': you_owe_count,
        'you_are_owed_count': you_are_owed_count,
        'settlement_rate': round(settlement_rate, 1),
        'total_pending': total_pending,
        'total_completed': total_completed,
    }