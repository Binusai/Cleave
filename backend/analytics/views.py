from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import spending_analytics, group_analytics, people_analytics, financial_health


@method_decorator(csrf_exempt, name='dispatch')
class AnalyticsOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        group_id = request.query_params.get('group_id')
        if group_id:
            group_id = int(group_id)

        overview = spending_analytics.get_overview(request.user, group_id=group_id, days=days)
        patterns = spending_analytics.get_expense_patterns(request.user, group_id=group_id, days=days)
        health = financial_health.get_financial_health(request.user)

        return Response({
            'overview': overview,
            'patterns': patterns,
            'health': health,
        })


@method_decorator(csrf_exempt, name='dispatch')
class SpendingTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        group_id = request.query_params.get('group_id')
        period = request.query_params.get('period', 'monthly')
        months = int(request.query_params.get('months', 12))

        if group_id:
            group_id = int(group_id)

        trends = spending_analytics.get_spending_trends(
            request.user, group_id=group_id, period=period, months=months
        )
        return Response(trends)


@method_decorator(csrf_exempt, name='dispatch')
class CategoryBreakdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        group_id = request.query_params.get('group_id')
        if group_id:
            group_id = int(group_id)

        categories = spending_analytics.get_category_breakdown(request.user, group_id=group_id, days=days)
        return Response(categories)


@method_decorator(csrf_exempt, name='dispatch')
class GroupAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        groups = group_analytics.get_group_analytics(request.user, days=days)[:limit]
        return Response(groups)


@method_decorator(csrf_exempt, name='dispatch')
class PeopleAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 90))
        limit = int(request.query_params.get('limit', 20))
        people = people_analytics.get_people_analytics(request.user, days=days)[:limit]
        return Response(people)


@method_decorator(csrf_exempt, name='dispatch')
class FinancialHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        health = financial_health.get_financial_health(request.user)
        return Response(health)