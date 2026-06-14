from rest_framework import serializers


class DateRangeSerializer(serializers.Serializer):
    days = serializers.IntegerField(default=30, min_value=7, max_value=365)
    group_id = serializers.IntegerField(required=False, allow_null=True)


class SpendingTrendsSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(required=False, allow_null=True)
    period = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'], default='monthly')
    months = serializers.IntegerField(default=12, min_value=1, max_value=24)