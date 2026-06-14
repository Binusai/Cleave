from rest_framework import serializers


class DashboardSummarySerializer(serializers.Serializer):
    you_owe = serializers.DecimalField(max_digits=12, decimal_places=2)
    you_are_owed = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_groups = serializers.IntegerField()
    total_expenses_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_settlements = serializers.IntegerField()
    settlement_completion_rate = serializers.FloatField()
    monthly_spending_trend = serializers.FloatField()