from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.AuthPageView.as_view(), name='auth_page'),
    path('login/submit/', views.LoginView.as_view(), name='login_page'),
    path('register/submit/', views.RegisterView.as_view(), name='register_page'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]