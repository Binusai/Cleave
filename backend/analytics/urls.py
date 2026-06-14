from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('spending-trends/', views.SpendingTrendsView.as_view(), name='spending_trends'),
    path('categories/', views.CategoryBreakdownView.as_view(), name='category_breakdown'),
    path('groups/', views.GroupAnalyticsView.as_view(), name='group_analytics'),
    path('people/', views.PeopleAnalyticsView.as_view(), name='people_analytics'),
    path('financial-health/', views.FinancialHealthView.as_view(), name='financial_health'),
]