from django.contrib import admin
from .models import Contact, ContactCategory


@admin.register(ContactCategory)
class ContactCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'is_default', 'created_at']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'email', 'category', 'is_favorite', 'shared_groups_count', 'net_balance']
    list_filter = ['category', 'is_favorite', 'is_active']
    search_fields = ['name', 'email', 'phone']