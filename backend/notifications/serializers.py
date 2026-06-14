from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'reference_id', 'reference_type', 'is_read',
            'created_at', 'time_ago'
        ]

    def get_time_ago(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 7:
            return obj.created_at.strftime('%d %b %Y')
        if diff.days > 0:
            return f'{diff.days}d ago'
        
        hours = diff.seconds // 3600
        if hours > 0:
            return f'{hours}h ago'
        
        minutes = diff.seconds // 60
        if minutes > 0:
            return f'{minutes}m ago'
        
        return 'just now'


class NotificationSummarySerializer(serializers.Serializer):
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    read = serializers.IntegerField()
    by_type = serializers.DictField()