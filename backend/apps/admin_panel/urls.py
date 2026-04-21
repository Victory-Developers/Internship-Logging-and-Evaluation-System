from django.urls import path
from .views import (
    PendingUsersView,
    ApproveUserView,
    RejectUserView,
    AllUsersView,
    SystemReportView,
    DashboardView,
)

urlpatterns = [
    # User management
    path('users/',                    AllUsersView.as_view(),     name='admin-all-users'),
    path('users/pending/',            PendingUsersView.as_view(), name='admin-pending-users'),
    path('users/<int:pk>/approve/',   ApproveUserView.as_view(),  name='admin-approve-user'),
    path('users/<int:pk>/reject/',    RejectUserView.as_view(),   name='admin-reject-user'),

    # Reports
    path('reports/',                  SystemReportView.as_view(), name='admin-system-report'),

    # Dashboard
    path('dashboard/',                DashboardView.as_view(),    name='admin-dashboard'),
]

# Investigating whether the path works