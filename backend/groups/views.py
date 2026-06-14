from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.crypto import get_random_string
from notifications.services import notify_member_added
from notifications.services import notify_group_created
from notifications.services import notify_invitation

from .models import Group, GroupMembership, GroupInvitation
from .serializers import (
    GroupSerializer,
    GroupDetailSerializer,
    GroupMembershipSerializer,
    GroupInvitationSerializer,
    CreateInvitationSerializer,
    UpdateMemberRoleSerializer,
)
from .permissions import IsGroupMember, IsGroupAdmin, IsGroupOwner

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class GroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.filter(
            memberships__user=request.user,
            memberships__status='active',
            is_active=True
        ).distinct()
        serializer = GroupSerializer(groups, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = GroupSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            group = serializer.save()
            notify_group_created(group)
            return Response(
                GroupDetailSerializer(group, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get_object(self, pk, user):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)
        return group

    def get(self, request, pk):
        group = self.get_object(pk, request.user)
        serializer = GroupDetailSerializer(group, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        group = self.get_object(pk, request.user)
        membership = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')
        if membership.role not in ['owner', 'admin']:
            return Response({'error': 'Only admins can edit the group'}, status=status.HTTP_403_FORBIDDEN)

        serializer = GroupSerializer(group, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = self.get_object(pk, request.user)
        membership = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')
        if membership.role != 'owner':
            return Response({'error': 'Only the owner can delete the group'}, status=status.HTTP_403_FORBIDDEN)

        group.is_active = False
        group.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class GroupMembersView(APIView):
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get_group(self, pk, user):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)
        return group

    def get(self, request, pk):
        group = self.get_group(pk, request.user)
        memberships = GroupMembership.objects.filter(group=group).select_related('user')
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        group = self.get_group(pk, request.user)
        current_membership = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        target_membership = get_object_or_404(GroupMembership, user_id=user_id, group=group)

        if target_membership.user == request.user:
            target_membership.status = 'left'
            target_membership.left_at = timezone.now()
            target_membership.save()
            return Response({'message': 'You left the group'})

        if current_membership.role not in ['owner', 'admin']:
            return Response({'error': 'Only admins can remove members'}, status=status.HTTP_403_FORBIDDEN)

        if target_membership.role == 'owner':
            return Response({'error': 'Cannot remove the group owner'}, status=status.HTTP_403_FORBIDDEN)

        target_membership.status = 'removed'
        target_membership.left_at = timezone.now()
        target_membership.save()
        return Response({'message': 'Member removed'})


@method_decorator(csrf_exempt, name='dispatch')
class UpdateMemberRoleView(APIView):
    permission_classes = [IsAuthenticated, IsGroupAdmin]

    def put(self, request, pk, user_id):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)

        current_membership = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')
        target_membership = get_object_or_404(GroupMembership, user_id=user_id, group=group, status='active')

        if target_membership.role == 'owner':
            return Response({'error': 'Cannot change the owner role'}, status=status.HTTP_403_FORBIDDEN)

        if current_membership.role == 'admin' and target_membership.role in ['owner', 'admin']:
            return Response({'error': 'Admins cannot modify other admins'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateMemberRoleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        target_membership.role = serializer.validated_data['role']
        target_membership.save()
        return Response(GroupMembershipSerializer(target_membership).data)


@method_decorator(csrf_exempt, name='dispatch')
class TransferOwnershipView(APIView):
    permission_classes = [IsAuthenticated, IsGroupOwner]

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)

        new_owner_id = request.data.get('user_id')
        if not new_owner_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        current_owner = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')
        new_owner = get_object_or_404(GroupMembership, user_id=new_owner_id, group=group, status='active')

        current_owner.role = 'admin'
        current_owner.save()

        new_owner.role = 'owner'
        new_owner.save()

        group.created_by_id = new_owner_id
        group.save()

        return Response({'message': 'Ownership transferred'})


@method_decorator(csrf_exempt, name='dispatch')
class InvitationListView(APIView):
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)
        invitations = group.invitations.all()
        serializer = GroupInvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)

        membership = get_object_or_404(GroupMembership, user=request.user, group=group, status='active')
        if membership.role not in ['owner', 'admin']:
            return Response({'error': 'Only admins can invite members'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateInvitationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        invited_user = None
        if serializer.validated_data.get('user_id'):
            invited_user = get_object_or_404(User, pk=serializer.validated_data['user_id'])

        if invited_user and GroupMembership.objects.filter(user=invited_user, group=group, status='active').exists():
            return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)

        invitation = GroupInvitation.objects.create(
            group=group,
            invited_by=request.user,
            invited_user=invited_user,
            message=serializer.validated_data.get('message', ''),
            expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        if invited_user:
            notify_invitation(invitation)

        return Response(GroupInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class MyInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invitations = GroupInvitation.objects.filter(
            Q(invited_user=request.user) | Q(invited_user__isnull=True),
            status='pending'
        )
        serializer = GroupInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name='dispatch')
class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id):
        invitation = get_object_or_404(GroupInvitation, pk=invitation_id, status='pending')

        if invitation.invited_user and invitation.invited_user != request.user:
            return Response({'error': 'This invitation is not for you'}, status=status.HTTP_403_FORBIDDEN)

        if invitation.is_expired():
            invitation.status = 'expired'
            invitation.save()
            return Response({'error': 'Invitation has expired'}, status=status.HTTP_400_BAD_REQUEST)

        membership, created = GroupMembership.objects.get_or_create(
            user=request.user,
            group=invitation.group,
            defaults={'role': 'member', 'status': 'active'}
        )

        if not created and membership.status != 'active':
            membership.status = 'active'
            membership.role = 'member'
            membership.left_at = None
            membership.save()

        invitation.status = 'accepted'
        invitation.accepted_at = timezone.now()
        invitation.invited_user = request.user
        invitation.save()

        return Response({'message': 'Invitation accepted'})


@method_decorator(csrf_exempt, name='dispatch')
class RejectInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id):
        invitation = get_object_or_404(GroupInvitation, pk=invitation_id, status='pending')
        invitation.status = 'rejected'
        invitation.save()
        return Response({'message': 'Invitation rejected'})

@method_decorator(csrf_exempt, name='dispatch')
class AddMemberView(APIView):
    permission_classes = [IsAuthenticated, IsGroupAdmin]

    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)

        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            email = f"{name.lower().replace(' ', '.')}@cleave.local"

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create_user(
                email=email,
                password=get_random_string(12),
                first_name=name,
                username=email,
            )

        if GroupMembership.objects.filter(user=user, group=group, status='active').exists():
            return Response({'error': 'This person is already a member'}, status=status.HTTP_400_BAD_REQUEST)

        existing = GroupMembership.objects.filter(user=user, group=group).first()
        if existing:
            existing.status = 'active'
            existing.role = 'member'
            existing.left_at = None
            existing.save()
        else:
            GroupMembership.objects.create(user=user, group=group, role='member', status='active')

        notify_member_added(group, request.user, user)
        
        return Response({
            'message': 'Member added',
            'name': user.get_full_name(),
            'email': user.email
        }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class GroupBalancesView(APIView):
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk, is_active=True)
        self.check_object_permissions(self.request, group)

        from expenses.models import Balance

        members = group.members.filter(memberships__status='active')
        balances = []

        for member in members:
            owes = float(Balance.objects.filter(
                group=group, debtor=member
            ).aggregate(total=Sum('amount'))['total'] or 0)

            owed = float(Balance.objects.filter(
                group=group, creditor=member
            ).aggregate(total=Sum('amount'))['total'] or 0)

            balances.append({
                'user_id': member.id,
                'name': member.get_full_name() or member.email.split('@')[0],
                'email': member.email,
                'paid': owed,
                'owes': owes,
                'balance': round(owed - owes, 2),
            })

        return Response(balances)