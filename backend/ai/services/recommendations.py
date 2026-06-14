from .financial_context import build_financial_context


def generate_recommendations(user):
    ctx = build_financial_context(user)
    recommendations = []

    fs = ctx['financial_summary']

    if fs['spending_change_percent'] > 15:
        recommendations.append({
            'type': 'reduce_spending',
            'title': 'Reduce Overall Spending',
            'message': f"Your spending is up {fs['spending_change_percent']}%. Review your expenses to find areas to cut back.",
            'potential_savings': round(fs['total_expenses_this_month'] * 0.15, 2),
            'action': 'Review Expenses',
        })

    if fs['top_category'] == 'Food' or fs['top_category'] == 'Food & Dining':
        recommendations.append({
            'type': 'dining',
            'title': 'Reduce Dining Expenses',
            'message': 'Dining out is your top expense. Consider cooking at home more often.',
            'potential_savings': round(fs['total_expenses_this_month'] * 0.2, 2),
            'action': 'View Food Expenses',
        })

    if fs['pending_owe'] > 1000:
        recommendations.append({
            'type': 'settle_debts',
            'title': 'Clear Pending Debts',
            'message': f"You owe ₹{fs['pending_owe']:,.0f}. Settling early avoids reminders and keeps groups healthy.",
            'potential_savings': 0,
            'action': 'View Settlements',
        })

    if fs['pending_owed'] > 2000:
        recommendations.append({
            'type': 'collect_dues',
            'title': 'Collect Pending Dues',
            'message': f"You're owed ₹{fs['pending_owed']:,.0f}. Send friendly reminders to your group members.",
            'potential_savings': 0,
            'action': 'Send Reminders',
        })

    if ctx['categories'] and len(ctx['categories']) > 0:
        top_two = sum(c['percent'] for c in ctx['categories'][:2])
        if top_two > 50:
            recommendations.append({
                'type': 'diversify',
                'title': 'Diversify Your Spending',
                'message': f"{top_two}% of your spending is in just two categories.",
                'potential_savings': round(fs['total_expenses_this_month'] * 0.1, 2),
                'action': 'View Category Breakdown',
            })

    if fs['settlement_rate'] < 70:
        recommendations.append({
            'type': 'improve_settlement',
            'title': 'Improve Settlement Rate',
            'message': f"Your settlement rate is {fs['settlement_rate']}%. Try to clear balances faster for better financial health.",
            'potential_savings': 0,
            'action': 'Settle Now',
        })

    return recommendations[:5]