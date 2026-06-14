from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, GroupMembership, GroupInvitation

User = get_user_model()


class GroupMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'user_email', 'user_name', 'user_avatar', 'role', 'status', 'joined_at', 'left_at']
        read_only_fields = ['joined_at', 'left_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email.split('@')[0]

    def get_user_avatar(self, obj):
        return None


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    total_expenses = serializers.SerializerMethodField()
    user_balance = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'image', 'group_type', 'currency',
            'created_by', 'member_count', 'total_expenses', 'user_balance',
            'user_role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_total_expenses(self, obj):
        return float(obj.total_expenses)

    def get_user_balance(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_balance(request.user)
        return 0

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_role(request.user)
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        group = Group.objects.create(**validated_data, created_by=user)
        GroupMembership.objects.create(user=user, group=group, role='owner', status='active')
        return group


class GroupDetailSerializer(GroupSerializer):
    members = serializers.SerializerMethodField()

    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members']

    def get_members(self, obj):
        memberships = obj.memberships.filter(status='active').select_related('user')
        return GroupMembershipSerializer(memberships, many=True).data


class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.SerializerMethodField()
    invited_user_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = GroupInvitation
        fields = [
            'id', 'group', 'group_name', 'invited_by', 'invited_by_name',
            'invited_user', 'invited_user_name', 'invite_code', 'message',
            'status', 'expires_at', 'accepted_at', 'created_at'
        ]
        read_only_fields = ['invited_by', 'invite_code', 'created_at', 'accepted_at']

    def get_invited_by_name(self, obj):
        return obj.invited_by.get_full_name()

    def get_invited_user_name(self, obj):
        return obj.invited_user.get_full_name() if obj.invited_user else ''


class CreateInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    user_id = serializers.IntegerField(required=False)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('email') and not data.get('user_id'):
            raise serializers.ValidationError('Either email or user_id is required')
        return data


class UpdateMemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['admin', 'member'])