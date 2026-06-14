from django.db import models
from django.conf import settings


class UserPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=20, default='cleave-blue')
    mode = models.CharField(max_length=10, default='light')
    compact_layout = models.BooleanField(default=False)
    large_text = models.BooleanField(default=False)
    reduced_motion = models.BooleanField(default=False)
    high_contrast = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    currency = models.CharField(max_length=3, default='INR')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    settlement_reminders = models.BooleanField(default=True)
    expense_updates = models.BooleanField(default=True)
    group_activity = models.BooleanField(default=True)
    weekly_summary = models.BooleanField(default=False)
    monthly_summary = models.BooleanField(default=True)
    ai_insights = models.BooleanField(default=True)
    spending_alerts = models.BooleanField(default=False)
    budget_recommendations = models.BooleanField(default=False)
    smart_suggestions = models.BooleanField(default=True)
    profile_visibility = models.CharField(max_length=15, default='members')
    phone_visibility = models.CharField(max_length=15, default='members')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_preferences'

    def __str__(self):
        return f"Preferences for {self.user.email}"