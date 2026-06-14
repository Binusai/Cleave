from django.db import models
from django.conf import settings
from django.utils import timezone


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, default='')
    color = models.CharField(max_length=7, default='#64748B')

    class Meta:
        db_table = 'expense_categories'
        verbose_name_plural = 'Expense categories'

    def __str__(self):
        return self.name


class Expense(models.Model):
    SPLIT_TYPE_CHOICES = [
        ('equal', 'Equal'),
        ('exact', 'Exact Amount'),
        ('percentage', 'Percentage'),
        ('shares', 'Shares'),
    ]

    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses_paid'
    )
    split_type = models.CharField(max_length=15, choices=SPLIT_TYPE_CHOICES, default='equal')
    expense_date = models.DateField()
    receipt = models.ImageField(upload_to='receipts/', blank=True, null=True)
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses_created'
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses_deleted'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f"{self.title} - ₹{self.amount}"

    def delete(self, soft=True, deleted_by=None):
        if soft:
            self.is_deleted = True
            self.deleted_at = timezone.now()
            self.deleted_by = deleted_by
            self.save()
        else:
            super().delete()


class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expense_splits'
    )
    share_amount = models.DecimalField(max_digits=12, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    shares = models.IntegerField(null=True, blank=True)
    is_included = models.BooleanField(default=True)

    class Meta:
        db_table = 'expense_splits'
        unique_together = ['expense', 'user']

    def __str__(self):
        return f"{self.user.email} owes ₹{self.share_amount} for {self.expense.title}"


class Balance(models.Model):
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='balances'
    )
    debtor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='debts'
    )
    creditor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credits'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expense_balances'
        unique_together = ['group', 'debtor', 'creditor']
        ordering = ['group', 'debtor']

    def __str__(self):
        return f"{self.debtor.email} → {self.creditor.email}: ₹{self.amount}"