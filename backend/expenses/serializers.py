from rest_framework import serializers
from .models import Expense, ExpenseSplit, ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'icon', 'color']


class ExpenseSplitSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user', 'user_name', 'user_email', 'share_amount', 'percentage', 'shares', 'is_included']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email.split('@')[0]


class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True, read_only=True)
    paid_by_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'group', 'title', 'description', 'category', 'category_name',
            'amount', 'currency', 'paid_by', 'paid_by_name', 'split_type',
            'expense_date', 'receipt', 'notes', 'splits',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_paid_by_name(self, obj):
        return obj.paid_by.get_full_name() if obj.paid_by else ''


class ExpenseCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    category_id = serializers.IntegerField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_by = serializers.IntegerField()
    split_type = serializers.ChoiceField(choices=['equal', 'exact', 'percentage', 'shares'])
    expense_date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    participants = serializers.ListField()

    def validate_participants(self, value):
        if not value:
            raise serializers.ValidationError('At least one participant is required')
        for p in value:
            if 'user_id' not in p:
                raise serializers.ValidationError('Each participant must have user_id')
        return value

    def validate_amount(self, value):
        if float(value) <= 0:
            raise serializers.ValidationError('Amount must be greater than 0')
        return value