from .financial_context import build_financial_context


def generate_insights(user):
    ctx = build_financial_context(user)
    insights = []

    fs = ctx['financial_summary']

    if fs['spending_change_percent'] > 10:
        insights.append({
            'type': 'spending_increase',
            'title': 'Spending Increase Detected',
            'message': f"Your spending increased by {fs['spending_change_percent']}% compared to last month.",
            'severity': 'warning',
            'icon': 'bx-trending-up',
        })
    elif fs['spending_change_percent'] < -5:
        insights.append({
            'type': 'spending_decrease',
            'title': 'Spending Decreased',
            'message': f"Your spending decreased by {abs(fs['spending_change_percent'])}% compared to last month. Great job!",
            'severity': 'positive',
            'icon': 'bx-trending-down',
        })

    if fs['top_category'] and fs['top_category'] != 'N/A':
        insights.append({
            'type': 'top_category',
            'title': 'Top Spending Category',
            'message': f"Your top spending category is {fs['top_category']}.",
            'severity': 'info',
            'icon': 'bx-pie-chart-alt',
        })

    if fs['pending_owed'] > 0:
        insights.append({
            'type': 'pending_collections',
            'title': 'Pending Collections',
            'message': f"You have ₹{fs['pending_owed']:,.0f} pending from others across your groups.",
            'severity': 'info',
            'icon': 'bx-wallet',
        })

    if fs['pending_owe'] > 0:
        insights.append({
            'type': 'pending_payments',
            'title': 'Pending Payments',
            'message': f"You owe ₹{fs['pending_owe']:,.0f} to others. Consider settling soon.",
            'severity': 'warning',
            'icon': 'bx-error-circle',
        })

    if fs['settlement_rate'] >= 90:
        insights.append({
            'type': 'settlement_rate',
            'title': 'Excellent Settlement Rate',
            'message': f"You've settled {fs['settlement_rate']}% of your balances. Keep it up!",
            'severity': 'positive',
            'icon': 'bx-check-shield',
        })

    if ctx['top_groups']:
        top_group = ctx['top_groups'][0]
        insights.append({
            'type': 'top_group',
            'title': 'Most Expensive Group',
            'message': f"{top_group['name']} is your highest spending group at ₹{top_group['total_spent']:,.0f}.",
            'severity': 'info',
            'icon': 'bx-group',
        })

    if ctx['top_people']:
        top_person = ctx['top_people'][0]
        insights.append({
            'type': 'top_person',
            'title': 'Most Active Person',
            'message': f"{top_person['name']} has paid ₹{top_person['total_paid']:,.0f} across {top_person['expense_count']} expenses.",
            'severity': 'info',
            'icon': 'bx-user-voice',
        })

    if ctx['health']['health_score'] >= 80:
        insights.append({
            'type': 'health_good',
            'title': 'Strong Financial Health',
            'message': f"Your financial health score is {ctx['health']['health_score']} — {ctx['health']['health_label']}.",
            'severity': 'positive',
            'icon': 'bx-heart',
        })

    return insights[:8]