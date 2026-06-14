from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from notifications.services import notify_settlement_completed
from notifications.services import notify_settlement_reminded

from .models import Settlement
from .serializers import SettlementSerializer
from .services import generate_settlements_from_balances, get_settlement_summary
from groups.models import Group


@method_decorator(csrf_exempt, name='dispatch')
class SettlementListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        group_id = request.query_params.get('group_id')
        status_filter = request.query_params.get('status', 'pending')

        group_ids = Group.objects.filter(
            memberships__user=request.user,
            memberships__status='active',
            is_active=True
        ).values_list('id', flat=True)

        settlements = Settlement.objects.filter(
            group_id__in=group_ids
        ).filter(
            Q(payer=request.user) | Q(payee=request.user)
        ).select_related('payer', 'payee', 'group', 'expense')

        if group_id:
            settlements = settlements.filter(group_id=group_id)
        if status_filter and status_filter != 'all':
            settlements = settlements.filter(status=status_filter)

        settlements = settlements.order_by('-created_at')

        serializer = SettlementSerializer(settlements, many=True, context={'request': request})
        return Response(serializer.data)


@method_decorator(csrf_exempt, name='dispatch')
class SettlementSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = get_settlement_summary(request.user)
        return Response(summary)


@method_decorator(csrf_exempt, name='dispatch')
class CompleteSettlementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        settlement = get_object_or_404(
            Settlement,
            pk=pk,
            payer=request.user,
            status='pending'
        )

        settlement.status = 'completed'
        settlement.settled_at = timezone.now()
        settlement.save()

        from expenses.services import recalculate_group_balances
        recalculate_group_balances(settlement.group)
        notify_settlement_completed(settlement)

        return Response(SettlementSerializer(settlement).data)


@method_decorator(csrf_exempt, name='dispatch')
class RemindSettlementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        settlement = get_object_or_404(
            Settlement,
            pk=pk,
            payee=request.user,
            status='pending'
        )

        settlement.reminded_at = timezone.now()
        settlement.save()
        notify_settlement_reminded(settlement)

        return Response({'message': f'Reminder sent to {settlement.payer.get_full_name()}'})


@method_decorator(csrf_exempt, name='dispatch')
class IgnoreSettlementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        settlement = get_object_or_404(
            Settlement,
            pk=pk,
            status='pending'
        )
        if settlement.payer != request.user and settlement.payee != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        settlement.status = 'ignored'
        settlement.save()

        return Response(SettlementSerializer(settlement).data)


@method_decorator(csrf_exempt, name='dispatch')
class GenerateSettlementsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, pk=group_id, members=request.user)
        count = generate_settlements_from_balances(group)
        return Response({'message': f'Generated {count} new settlements'})


@method_decorator(csrf_exempt, name='dispatch')
class SettlementProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        group_ids = Group.objects.filter(
            memberships__user=request.user,
            memberships__status='active',
            is_active=True
        ).values_list('id', flat=True)

        progress_data = []
        for group_id in group_ids:
            group = Group.objects.get(pk=group_id)
            total = Settlement.objects.filter(group=group).count()
            completed = Settlement.objects.filter(group=group, status='completed').count()
            pct = round((completed / total * 100)) if total > 0 else 0
            progress_data.append({
                'group_id': group.id,
                'group_name': group.name,
                'progress': pct,
                'total': total,
                'completed': completed,
            })

        return Response(progress_data)