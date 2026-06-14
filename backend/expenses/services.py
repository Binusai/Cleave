from django.db.models import Sum
from collections import defaultdict
from .models import ExpenseSplit, Balance


def calculate_splits(expense, split_type, participants):
    total = float(expense.amount)
    splits = []

    if split_type == 'equal':
        included = [p for p in participants if p.get('is_included', True)]
        count = len(included)
        if count == 0:
            return []
        share = round(total / count, 2)
        remainder = round(total - share * count, 2)
        for i, p in enumerate(included):
            amount = share + (remainder if i == 0 else 0)
            splits.append({
                'user_id': p['user_id'],
                'share_amount': amount,
                'is_included': True,
            })
        for p in participants:
            if not p.get('is_included', True):
                splits.append({
                    'user_id': p['user_id'],
                    'share_amount': 0,
                    'is_included': False,
                })

    elif split_type == 'exact':
        for p in participants:
            splits.append({
                'user_id': p['user_id'],
                'share_amount': float(p['amount']),
                'is_included': True,
            })

    elif split_type == 'percentage':
        for p in participants:
            amount = round(total * float(p['percentage']) / 100, 2)
            splits.append({
                'user_id': p['user_id'],
                'share_amount': amount,
                'percentage': float(p['percentage']),
                'is_included': True,
            })

    elif split_type == 'shares':
        total_shares = sum(int(p['shares']) for p in participants)
        for i, p in enumerate(participants):
            amount = round(total * int(p['shares']) / total_shares, 2)
            if i == len(participants) - 1:
                current_sum = sum(
                    round(total * int(x['shares']) / total_shares, 2)
                    for x in participants[:-1]
                )
                amount = round(total - current_sum, 2)
            splits.append({
                'user_id': p['user_id'],
                'share_amount': amount,
                'shares': int(p['shares']),
                'is_included': True,
            })

    return splits


def save_expense_splits(expense, splits_data):
    ExpenseSplit.objects.filter(expense=expense).delete()
    for split in splits_data:
        ExpenseSplit.objects.create(
            expense=expense,
            user_id=split['user_id'],
            share_amount=split['share_amount'],
            percentage=split.get('percentage'),
            shares=split.get('shares'),
            is_included=split.get('is_included', True),
        )


def recalculate_group_balances(group):
    Balance.objects.filter(group=group).delete()

    net_balances = defaultdict(float)

    splits = ExpenseSplit.objects.filter(
        expense__group=group,
        expense__is_deleted=False,
        is_included=True
    ).select_related('expense')

    for split in splits:
        debtor = split.user_id
        creditor = split.expense.paid_by_id
        if debtor != creditor:
            net_balances[(debtor, creditor)] += float(split.share_amount)
            net_balances[(creditor, debtor)] -= float(split.share_amount)

    balances_to_create = []
    for (debtor, creditor), amount in net_balances.items():
        if amount > 0.01:
            balances_to_create.append(
                Balance(
                    group=group,
                    debtor_id=debtor,
                    creditor_id=creditor,
                    amount=round(amount, 2)
                )
            )

    Balance.objects.bulk_create(balances_to_create)


def get_user_total_owed(user):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user,
        memberships__status='active',
        is_active=True
    ).values_list('id', flat=True)
    return float(
        Balance.objects.filter(group_id__in=group_ids, debtor=user).aggregate(
            total=Sum('amount')
        )['total'] or 0
    )


def get_user_total_owed_to(user):
    from groups.models import Group
    group_ids = Group.objects.filter(
        memberships__user=user,
        memberships__status='active',
        is_active=True
    ).values_list('id', flat=True)
    return float(
        Balance.objects.filter(group_id__in=group_ids, creditor=user).aggregate(
            total=Sum('amount')
        )['total'] or 0
    )