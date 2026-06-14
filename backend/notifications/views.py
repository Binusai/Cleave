from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer
from .services import get_notification_summary


@method_decorator(csrf_exempt, name='dispatch')
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notification_type = request.query_params.get('type')
        unread_only = request.query_params.get('unread') == 'true'
        limit = int(request.query_params.get('limit', 50))

        notifications = Notification.objects.filter(user=request.user)

        if notification_type:
            notifications = notifications.filter(notification_type=notification_type)
        if unread_only:
            notifications = notifications.filter(is_read=False)

        notifications = notifications[:limit]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name='dispatch')
class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


@method_decorator(csrf_exempt, name='dispatch')
class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = Notification.objects.filter(pk=pk, user=request.user).first()
        if notification:
            notification.is_read = True
            notification.save()
            return Response({'message': 'Marked as read'})
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All marked as read'})


@method_decorator(csrf_exempt, name='dispatch')
class NotificationSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = get_notification_summary(request.user)
        return Response(summary)