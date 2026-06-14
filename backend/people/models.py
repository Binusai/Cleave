from django.db import models
from django.conf import settings


class ContactCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, default='bx-user')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Contact(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contacts')
    contact_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='linked_contacts'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    category = models.ForeignKey(
        ContactCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contacts'
    )
    notes = models.TextField(blank=True, default='')
    photo = models.ImageField(upload_to='contacts/', blank=True, null=True)
    is_favorite = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contacts'
        ordering = ['-is_favorite', 'name']

    def __str__(self):
        return self.name

    @property
    def shared_groups_count(self):
        if not self.contact_user:
            return 0
        from groups.models import GroupMembership
        owner_groups = GroupMembership.objects.filter(
            user=self.owner, status='active'
        ).values_list('group_id', flat=True)
        return GroupMembership.objects.filter(
            user=self.contact_user,
            group_id__in=owner_groups,
            status='active'
        ).count()

    @property
    def net_balance(self):
        if not self.contact_user:
            return 0
        from expenses.models import Balance
        from groups.models import Group
        group_ids = Group.objects.filter(
            memberships__user=self.owner,
            memberships__status='active',
            is_active=True
        ).values_list('id', flat=True)

        owes_me = float(Balance.objects.filter(
            group_id__in=group_ids,
            debtor=self.contact_user,
            creditor=self.owner
        ).aggregate(total=models.Sum('amount'))['total'] or 0)

        i_owe = float(Balance.objects.filter(
            group_id__in=group_ids,
            debtor=self.owner,
            creditor=self.contact_user
        ).aggregate(total=models.Sum('amount'))['total'] or 0)

        return owes_me - i_owe