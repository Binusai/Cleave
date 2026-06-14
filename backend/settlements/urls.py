from django.urls import path
from . import views

urlpatterns = [
    path('', views.SettlementListView.as_view(), name='settlement_list'),
    path('summary/', views.SettlementSummaryView.as_view(), name='settlement_summary'),
    path('progress/', views.SettlementProgressView.as_view(), name='settlement_progress'),
    path('<int:pk>/complete/', views.CompleteSettlementView.as_view(), name='complete_settlement'),
    path('<int:pk>/remind/', views.RemindSettlementView.as_view(), name='remind_settlement'),
    path('<int:pk>/ignore/', views.IgnoreSettlementView.as_view(), name='ignore_settlement'),
    path('generate/<int:group_id>/', views.GenerateSettlementsView.as_view(), name='generate_settlements'),
]