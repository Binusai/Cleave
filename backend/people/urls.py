from django.urls import path
from . import views

urlpatterns = [
    path('', views.ContactListView.as_view(), name='contact_list'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/', views.ContactDetailView.as_view(), name='contact_detail'),
    path('<int:pk>/favorite/', views.ToggleFavoriteView.as_view(), name='toggle_favorite'),
]