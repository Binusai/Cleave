from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from . import api_views

urlpatterns = [
    path('login/', api_views.LoginAPIView.as_view(), name='api_login'),
    path('register/', api_views.RegisterAPIView.as_view(), name='api_register'),
    path('google/', api_views.GoogleAuthAPIView.as_view(), name='api_google_auth'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('profile/', api_views.UserProfileAPIView.as_view(), name='api_profile'),
]