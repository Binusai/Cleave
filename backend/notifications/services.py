from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


def create_notification(user, title, message, notification_type, reference_id=None, reference_type=''):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id,
        reference_type=reference_type,
    )


def notify_expense_added(expense, group):
    members = group.members.filter(memberships__status='active').exclude(id=expense.paid_by_id)
    payer_name = expense.paid_by.get_full_name() or expense.paid_by.email.split('@')[0]
    
    for member in members:
        create_notification(
            user=member,
            title='Expense Added',
            message=f'{payer_name} added {expense.title} of ₹{float(expense.amount):,.0f} in {group.name}.',
            notification_type='expense',
            reference_id=expense.id,
            reference_type='expense',
        )


def notify_settlement_completed(settlement):
    payer_name = settlement.payer.get_full_name() or settlement.payer.email.split('@')[0]
    
    create_notification(
        user=settlement.payee,
        title='Settlement Received',
        message=f'{payer_name} paid you ₹{float(settlement.amount):,.0f} for {settlement.group.name}.',
        notification_type='settlement',
        reference_id=settlement.id,
        reference_type='settlement',
    )


def notify_settlement_reminded(settlement):
    payee_name = settlement.payee.get_full_name() or settlement.payee.email.split('@')[0]
    
    create_notification(
        user=settlement.payer,
        title='Settlement Reminder',
        message=f'{payee_name} sent you a reminder to settle ₹{float(settlement.amount):,.0f} for {settlement.group.name}.',
        notification_type='settlement',
        reference_id=settlement.id,
        reference_type='settlement',
    )


def notify_member_added(group, added_by, new_member):
    adder_name = added_by.get_full_name() or added_by.email.split('@')[0]
    member_name = new_member.get_full_name() or new_member.email.split('@')[0]
    
    members = group.members.filter(memberships__status='active').exclude(id__in=[added_by.id, new_member.id])
    for member in members:
        create_notification(
            user=member,
            title='Member Joined',
            message=f'{adder_name} added {member_name} to {group.name}.',
            notification_type='group',
            reference_id=group.id,
            reference_type='group',
        )
    
    create_notification(
        user=new_member,
        title='Added to Group',
        message=f'{adder_name} added you to {group.name}.',
        notification_type='group',
        reference_id=group.id,
        reference_type='group',
    )


def notify_group_created(group):
    members = group.members.filter(memberships__status='active').exclude(id=group.created_by_id)
    creator_name = group.created_by.get_full_name() if group.created_by else 'Someone'
    
    for member in members:
        create_notification(
            user=member,
            title='New Group',
            message=f'{creator_name} created the group {group.name}.',
            notification_type='group',
            reference_id=group.id,
            reference_type='group',
        )


def notify_invitation(invitation):
    create_notification(
        user=invitation.invited_user,
        title='Group Invitation',
        message=f'{invitation.invited_by.get_full_name()} invited you to join {invitation.group.name}.',
        notification_type='invitation',
        reference_id=invitation.id,
        reference_type='invitation',
    )


def get_notification_summary(user):
    notifications = Notification.objects.filter(user=user)
    total = notifications.count()
    unread = notifications.filter(is_read=False).count()
    
    type_counts = {}
    for nt in Notification.NOTIFICATION_TYPES:
        type_counts[nt[0]] = notifications.filter(notification_type=nt[0]).count()
    
    return {
        'total': total,
        'unread': unread,
        'read': total - unread,
        'by_type': type_counts,
    }