from rest_framework import serializers
from django.contrib.auth import get_user_model
from expenses.services import get_user_total_owed, get_user_total_owed_to
from analytics.services.financial_health import get_financial_health
from .models import UserPreferences

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    member_since = serializers.DateTimeField(source='date_joined', format='%B %Y', read_only=True)
    account_id = serializers.SerializerMethodField()
    is_email_verified = serializers.BooleanField(read_only=True)
    is_phone_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'phone_number', 'is_email_verified', 'is_phone_verified',
            'member_since', 'account_id', 'date_joined'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email.split('@')[0]

    def get_account_id(self, obj):
        return f'CLV-{obj.date_joined.year}-{obj.id:05d}'


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)


class ProfileOverviewSerializer(serializers.Serializer):
    user = UserProfileSerializer()
    total_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expenses_count = serializers.IntegerField()
    active_groups = serializers.IntegerField()
    total_settled = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_settlements_count = serializers.IntegerField()
    you_owe = serializers.DecimalField(max_digits=12, decimal_places=2)
    you_are_owed = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    financial_health = serializers.DictField()
    
    
    
class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            'theme', 'mode', 'compact_layout', 'large_text', 'reduced_motion',
            'high_contrast', 'language', 'currency', 'timezone',
            'email_notifications', 'push_notifications', 'settlement_reminders',
            'expense_updates', 'group_activity', 'weekly_summary', 'monthly_summary',
            'ai_insights', 'spending_alerts', 'budget_recommendations', 'smart_suggestions',
            'profile_visibility', 'phone_visibility',
        ]