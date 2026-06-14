from rest_framework import serializers
from .models import Settlement


class SettlementSerializer(serializers.ModelSerializer):
    payer_name = serializers.SerializerMethodField()
    payer_email = serializers.EmailField(source='payer.email', read_only=True)
    payee_name = serializers.SerializerMethodField()
    payee_email = serializers.EmailField(source='payee.email', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    expense_title = serializers.CharField(source='expense.title', read_only=True)

    class Meta:
        model = Settlement
        fields = [
            'id', 'group', 'group_name', 'expense', 'expense_title',
            'payer', 'payer_name', 'payer_email',
            'payee', 'payee_name', 'payee_email',
            'amount', 'status', 'reminded_at', 'settled_at', 'created_at'
        ]
        read_only_fields = ['created_at', 'settled_at', 'reminded_at']

    def get_payer_name(self, obj):
        return obj.payer.get_full_name() or obj.payer.email.split('@')[0]

    def get_payee_name(self, obj):
        return obj.payee.get_full_name() or obj.payee.email.split('@')[0]


class SettlementSummarySerializer(serializers.Serializer):
    you_owe = serializers.DecimalField(max_digits=12, decimal_places=2)
    you_are_owed = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    you_owe_count = serializers.IntegerField()
    you_are_owed_count = serializers.IntegerField()
    settlement_rate = serializers.FloatField()
    total_pending = serializers.IntegerField()
    total_completed = serializers.IntegerField()