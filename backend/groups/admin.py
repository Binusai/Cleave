from django.contrib import admin
from .models import Group, GroupMembership, GroupInvitation


class GroupMembershipInline(admin.TabularInline):
    model = GroupMembership
    extra = 0
    fields = ['user', 'role', 'status', 'joined_at', 'left_at']
    readonly_fields = ['joined_at']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'group_type', 'currency', 'created_by', 'member_count_display', 'is_active', 'created_at']
    list_filter = ['group_type', 'currency', 'is_active']
    search_fields = ['name', 'description']
    inlines = [GroupMembershipInline]

    def member_count_display(self, obj):
        return obj.member_count
    member_count_display.short_description = 'Members'


@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ['group', 'invited_by', 'invited_user', 'status', 'created_at', 'expires_at']
    list_filter = ['status']
    search_fields = ['group__name', 'invited_by__email', 'invited_user__email']