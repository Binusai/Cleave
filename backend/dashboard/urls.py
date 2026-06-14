from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('activity/', views.RecentActivityView.as_view(), name='recent_activity'),
    path('groups/', views.DashboardGroupBalancesView.as_view(), name='dashboard_groups'),
    path('monthly-spending/', views.MonthlySpendingView.as_view(), name='monthly_spending'),
    path('category-breakdown/', views.CategoryBreakdownView.as_view(), name='category_breakdown'),
]