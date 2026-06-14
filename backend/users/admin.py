from django.contrib import admin
from .models import UserPreferences

@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'theme', 'mode', 'language', 'currency']