from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.ProfileOverviewView.as_view(), name='profile_overview'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile_update'),
    path('profile/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('profile/deactivate/', views.DeactivateAccountView.as_view(), name='deactivate_account'),
    path('preferences/', views.PreferencesView.as_view(), name='preferences'),
]