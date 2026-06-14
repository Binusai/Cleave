from django.db import models
from django.db.models import Sum
from django.conf import settings
from django.utils import timezone
import uuid


class Group(models.Model):
    GROUP_TYPES = [
        ('friends', 'Friends'),
        ('family', 'Family'),
        ('trip', 'Trip'),
        ('couple', 'Couple'),
        ('roommates', 'Roommates'),
        ('office', 'Office'),
        ('event', 'Event'),
        ('custom', 'Custom'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='groups/', blank=True, null=True)
    group_type = models.CharField(max_length=20, choices=GROUP_TYPES, default='custom')
    currency = models.CharField(max_length=3, default='INR')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_groups'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='GroupMembership',
        related_name='expense_groups'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'groups'
        ordering = ['-updated_at']

    def __str__(self):
        return self.name

    @property
    def total_expenses(self):
        return self.expenses.filter(is_deleted=False).aggregate(
            total=models.Sum('amount'))['total'] or 0

    @property
    def member_count(self):
        return self.memberships.filter(status='active').count()

    @property
    def active_members(self):
        return self.members.filter(memberships__status='active')

    def get_user_role(self, user):
        membership = self.memberships.filter(user=user, status='active').first()
        return membership.role if membership else None

    def get_user_balance(self, user):
        from expenses.models import Balance
        owed = float(Balance.objects.filter(group=self, creditor=user).aggregate(
            total=Sum('amount'))['total'] or 0)
        owes = float(Balance.objects.filter(group=self, debtor=user).aggregate(
            total=Sum('amount'))['total'] or 0)
        return round(owed - owes, 2)


class GroupMembership(models.Model):
    ROLES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('invited', 'Invited'),
        ('left', 'Left'),
        ('removed', 'Removed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=15, choices=ROLES, default='member')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'group_memberships'
        unique_together = ['user', 'group']

    def __str__(self):
        return f"{self.user.email} - {self.group.name} ({self.role})"


class GroupInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invitations')
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    invited_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_invitations',
        null=True,
        blank=True
    )
    invite_code = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    message = models.TextField(blank=True, default='')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_invitations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Invite to {self.group.name} by {self.invited_by.email}"

    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False