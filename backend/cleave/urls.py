from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    path('api/auth/', include('authentication.api_urls')),
    path('api/groups/', include('groups.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/settlements/', include('settlements.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/people/', include('people.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/users/', include('users.urls')),
    path('api/ai/', include('ai.urls')),
]