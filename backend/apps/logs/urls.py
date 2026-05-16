from django.urls import path
from .views import (
    StudentLogListCreateView,
    StudentLogDetailView,
    StudentLogSubmitView,
    StudentProgressView,
    WorkplaceLogListView,
    WorkplaceLogReviewView,
    AcademicLogListView,
    AdminLogListView,
    LogCommentCreateView,
    LogDetailView,
)

urlpatterns = [
    # Student
    path('my/',                              StudentLogListCreateView.as_view(), name='student-log-list-create'),
    path('my/progress/',                     StudentProgressView.as_view(),      name='student-log-progress'),
    path('my/<int:pk>/',                     StudentLogDetailView.as_view(),     name='student-log-detail'),
    path('my/<int:pk>/submit/',              StudentLogSubmitView.as_view(),     name='student-log-submit'),

    # Workplace supervisor
    path('supervisor/',                      WorkplaceLogListView.as_view(),     name='workplace-log-list'),
    path('supervisor/<int:pk>/review/',      WorkplaceLogReviewView.as_view(),   name='workplace-log-review'),

    # Academic supervisor
    path('academic/',                        AcademicLogListView.as_view(),      name='academic-log-list'),

    # Admin
    path('admin/',                           AdminLogListView.as_view(),         name='admin-log-list'),

    # General Detail View (for supervisors/admin/student)
    path('<int:pk>/',                        LogDetailView.as_view(),            name='log-detail'),

    # Comments (workplace + academic supervisor)
    path('<int:pk>/comments/',               LogCommentCreateView.as_view(),     name='log-comment-create'),
]