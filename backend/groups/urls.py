from django.urls import path
from . import views

urlpatterns = [
    path('', views.GroupListView.as_view(), name='group_list'),
    path('<int:pk>/', views.GroupDetailView.as_view(), name='group_detail'),
    path('<int:pk>/members/', views.GroupMembersView.as_view(), name='group_members'),
    path('<int:pk>/members/<int:user_id>/role/', views.UpdateMemberRoleView.as_view(), name='update_member_role'),
    path('<int:pk>/transfer-ownership/', views.TransferOwnershipView.as_view(), name='transfer_ownership'),
    path('<int:pk>/invitations/', views.InvitationListView.as_view(), name='group_invitations'),
        path('<int:pk>/add-member/', views.AddMemberView.as_view(), name='add_member'),
    path('<int:pk>/balances/', views.GroupBalancesView.as_view(), name='group_balances'),
    path('invitations/', views.MyInvitationsView.as_view(), name='my_invitations'),
    path('invitations/<int:invitation_id>/accept/', views.AcceptInvitationView.as_view(), name='accept_invitation'),
    path('invitations/<int:invitation_id>/reject/', views.RejectInvitationView.as_view(), name='reject_invitation'),
]