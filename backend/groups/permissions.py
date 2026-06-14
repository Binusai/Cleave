from rest_framework.permissions import BasePermission
from .models import GroupMembership


class IsGroupMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.memberships.filter(user=request.user, status='active').exists()


class IsGroupAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.memberships.filter(
            user=request.user,
            status='active',
            role__in=['owner', 'admin']
        ).exists()


class IsGroupOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.memberships.filter(
            user=request.user,
            status='active',
            role='owner'
        ).exists()