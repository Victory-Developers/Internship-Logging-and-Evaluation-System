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

    # Academic superviso
    path('academic/',                        AcademicLogListView.as_view(),      name='academic-log-list'),

    # Admin
    path('admin/',                           AdminLogListView.as_view(),         name='admin-log-list'),

    # Comments (workplace + academic supervisors)
    path('<int:pk>/comments/',               LogCommentCreateView.as_view(),     name='log-comment-create'),
]