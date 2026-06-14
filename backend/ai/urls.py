from django.urls import path
from . import views

urlpatterns = [
    path('insights/', views.AIInsightsView.as_view(), name='ai_insights'),
    path('recommendations/', views.AIRecommendationsView.as_view(), name='ai_recommendations'),
    path('chat/', views.AIChatView.as_view(), name='ai_chat'),
    path('context/', views.AIContextView.as_view(), name='ai_context'),
    path('suggested-questions/', views.AISuggestedQuestionsView.as_view(), name='ai_questions'),
]