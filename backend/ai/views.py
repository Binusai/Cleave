from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services.insights import generate_insights
from .services.recommendations import generate_recommendations
from .services.chat_service import process_chat
from .services.financial_context import build_financial_context
from .serializers import ChatMessageSerializer


@method_decorator(csrf_exempt, name='dispatch')
class AIInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        insights = generate_insights(request.user)
        recommendations = generate_recommendations(request.user)
        health = build_financial_context(request.user)

        return Response({
            'insights': insights,
            'recommendations': recommendations,
            'health_score': health['health']['health_score'],
            'health_label': health['health']['health_label'],
            'top_category': health['financial_summary']['top_category'],
            'total_spent_this_month': health['financial_summary']['total_expenses_this_month'],
            'pending_owe': health['financial_summary']['pending_owe'],
            'pending_owed': health['financial_summary']['pending_owed'],
            'settlement_rate': health['financial_summary']['settlement_rate'],
            'potential_savings': sum(r['potential_savings'] for r in recommendations),
        })


@method_decorator(csrf_exempt, name='dispatch')
class AIRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recommendations = generate_recommendations(request.user)
        return Response(recommendations)


@method_decorator(csrf_exempt, name='dispatch')
class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Message is required'}, status=400)

        message = serializer.validated_data['message']
        response = process_chat(request.user, message)
        return Response(response)


@method_decorator(csrf_exempt, name='dispatch')
class AIContextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ctx = build_financial_context(request.user)
        return Response(ctx)


@method_decorator(csrf_exempt, name='dispatch')
class AISuggestedQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questions = [
            "Where did I spend most this month?",
            "Who owes me the most?",
            "Show my pending settlements.",
            "How can I save money?",
            "Which group costs me the most?",
            "Compare this month with last month.",
            "What's my financial health score?",
            "How much am I owed?",
        ]
        return Response(questions)