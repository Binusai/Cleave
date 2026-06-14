from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Expense, ExpenseSplit, ExpenseCategory, Balance


class ExpenseSplitInline(admin.TabularInline):
    model = ExpenseSplit
    extra = 0
    fields = ['user', 'share_amount', 'percentage', 'shares', 'is_included']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'group', 'amount', 'paid_by', 'split_type', 'expense_date', 'is_deleted']
    list_filter = ['split_type', 'is_deleted', 'category']
    search_fields = ['title', 'description', 'group__name']
    inlines = [ExpenseSplitInline]


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color']


@admin.register(ExpenseSplit)
class ExpenseSplitAdmin(admin.ModelAdmin):
    list_display = ['expense', 'user', 'share_amount', 'is_included']


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ['group', 'debtor', 'creditor', 'amount', 'updated_at']
    list_filter = ['group']
    search_fields = ['debtor__email', 'creditor__email', 'group__name']