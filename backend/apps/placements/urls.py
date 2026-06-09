from django.urls import path
from .views import (
    CompanyListCreateView,
    CompanySearchView,
    PlacementListCreateView,
    PlacementDetailView,
    MyPlacementView,
    StudentPlacementSubmitView,
    WorkplacePlacementsView,
    AcademicPlacementsView,
)

urlpatterns = [
    # Companies
    path('companies/',        CompanyListCreateView.as_view(), name='company-list-create'),
    path('companies/search/', CompanySearchView.as_view(),     name='company-search'),

    # Admin
    path('',                        PlacementListCreateView.as_view(), name='placement-list-create'),
    path('<int:pk>/',               PlacementDetailView.as_view(),     name='placement-detail'),

    # Student
    path('my/',                     MyPlacementView.as_view(),              name='my-placement'),
    path('submit/',                 StudentPlacementSubmitView.as_view(),   name='student-placement-submit'),

    # Workplace supervisor
    path('my-students/',            WorkplacePlacementsView.as_view(), name='workplace-placements'),

    # Academic supervisor
    path('my-academic-students/',   AcademicPlacementsView.as_view(),  name='academic-placements'),
]