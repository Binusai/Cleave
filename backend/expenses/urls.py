from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('groups/<int:group_id>/', views.GroupExpenseListView.as_view(), name='group_expenses'),
    path('<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
]