from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Company, Placement
from .serializers import (
    CompanySerializer,
    CompanySearchSerializer,
    PlacementSerializer,
    PlacementCreateSerializer,
    StudentPlacementSubmitSerializer,
)
from apps.shared_permissions import IsAdmin, IsStudent, IsActiveUser

class CompanyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/companies/          — List all companies
    POST /api/companies/          — Create a company
    """
    permission_classes = [IsActiveUser]
    serializer_class   = CompanySerializer
    queryset           = Company.objects.all()
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ['name', 'address']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CompanySearchView(generics.ListAPIView):
    """
    GET /api/companies/search/?q=...  — Autocomplete search, returns top 10.
    """
    permission_classes  = [IsActiveUser]
    serializer_class    = CompanySearchSerializer
    pagination_class    = None

    @extend_schema(
        parameters=[OpenApiParameter('q', OpenApiTypes.STR, description='Search query')],
        tags=['Companies'],
    )
    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            return Company.objects.none()
        return Company.objects.filter(name__icontains=q)[:10]


class PlacementListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/placements/          — Admin: list all placements
    POST /api/placements/          — Admin: create a placement
    """
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlacementCreateSerializer
        return PlacementSerializer

    queryset = Placement.objects.select_related(
        'student', 'workplace_supervisor', 'academic_supervisor', 'created_by', 'company'                                                                                                     
    )                                  
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]                                                                                                         
    filterset_fields   = ['status']                                          
    search_fields      = ['company_name', 'job_title', 'student__full_name', 'workplace_supervisor__full_name']                                                                      
    ordering_fields    = ['start_date', 'created_at', 'company_name']                                          
    ordering           = ['-created_at']   

    @extend_schema(
        description='List all internship placements. Filter by ?status=active|pending|completed|cancelled.',
        tags=['Placements — Admin'],
        parameters=[
            OpenApiParameter('status', OpenApiTypes.STR, description='Filter by placement status'),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        request=PlacementCreateSerializer,
        responses={
            201: OpenApiResponse(description='Placement created'),
            400: OpenApiResponse(description='Validation errors'),
        },
        description=(
            'Create an internship placement. '
            'Assign student, workplace supervisor, academic supervisor, dates.'
        ),
        tags=['Placements — Admin'],
    )
    def post(self, request, *args, **kwargs):
        serializer = PlacementCreateSerializer(data=request.data)
        if serializer.is_valid():
            placement = serializer.save(created_by=request.user)
            return Response(
                PlacementSerializer(placement).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlacementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/placements/<id>/   — Admin: retrieve a placement
    PATCH  /api/placements/<id>/   — Admin: update a placement
    DELETE /api/placements/<id>/   — Admin: delete a placement
    """
    permission_classes = [IsAdmin]
    queryset = Placement.objects.select_related(
        'student', 'workplace_supervisor', 'academic_supervisor', 'created_by', 'company'
    )

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return PlacementCreateSerializer
        return PlacementSerializer

    @extend_schema(tags=['Placements — Admin'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        request=PlacementCreateSerializer,
        tags=['Placements — Admin'],
        description='Partially update a placement (PATCH).',
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(tags=['Placements — Admin'])
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class MyPlacementView(APIView):
    """
    GET   /api/placements/my/   — Student: get own placement details.
    PATCH /api/placements/my/   — Student: update workplace supervisor info.
    """
    permission_classes = [IsStudent]

    @extend_schema(
        responses={
            200: PlacementSerializer,
            404: OpenApiResponse(description='No placement assigned yet'),
        },
        description='Get the currently logged-in student\'s placement details.',
        tags=['Placements — Student'],
    )
    def get(self, request):
        try:
            placement = Placement.objects.select_related(
                'student', 'workplace_supervisor', 'academic_supervisor', 'company'
            ).get(student=request.user)
        except Placement.DoesNotExist:
            return Response(
                {'detail': 'You have not been assigned a placement yet.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(PlacementSerializer(placement).data)

    @extend_schema(
        request=PlacementSerializer,
        responses={
            200: PlacementSerializer,
            404: OpenApiResponse(description='No placement assigned yet'),
        },
        description='Update the workplace supervisor info for the student\'s placement.',
        tags=['Placements — Student'],
    )
    def patch(self, request):
        try:
            placement = Placement.objects.get(student=request.user)
        except Placement.DoesNotExist:
            return Response(
                {'detail': 'You do not have a placement request to update.'},
                status=status.HTTP_404_NOT_FOUND
            )

        invited_email = request.data.get('invited_supervisor_email', '').strip()
        workplace_supervisor_id = request.data.get('workplace_supervisor')

        if invited_email:
            placement.invited_supervisor_email = invited_email
        
        if workplace_supervisor_id is not None:
            if workplace_supervisor_id == '' or workplace_supervisor_id == 0:
                placement.workplace_supervisor = None
            else:
                from apps.users.models import User
                try:
                    supervisor = User.objects.get(id=workplace_supervisor_id, role='workplace_supervisor')
                    placement.workplace_supervisor = supervisor
                except User.DoesNotExist:
                    pass

        placement.save()
        return Response(PlacementSerializer(placement).data)


class StudentPlacementSubmitView(APIView):
    """
    POST /api/placements/submit/  — Student submits a placement request.
    """
    permission_classes = [IsStudent]

    @extend_schema(
        request=StudentPlacementSubmitSerializer,
        responses={201: PlacementSerializer},
        tags=['Placements — Student'],
    )
    def post(self, request):
        serializer = StudentPlacementSubmitSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            placement = serializer.save()
            return Response(
                PlacementSerializer(placement).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ─── Workplace supervisor: view assigned students ─────────────────────────────

class WorkplacePlacementsView(generics.ListAPIView):
    """
    GET /api/placements/my-students/   — Workplace supervisor: list assigned students.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    serializer_class   = PlacementSerializer

    @extend_schema(
        description='List placements where the logged-in user is the workplace supervisor.',
        tags=['Placements — Workplace Supervisor'],
    )
    def get_queryset(self):
        return Placement.objects.select_related(
            'student', 'workplace_supervisor', 'academic_supervisor', 'company'
        ).filter(workplace_supervisor=self.request.user)


# ─── Academic supervisor: view assigned students ──────────────────────────────

class AcademicPlacementsView(generics.ListAPIView):
    """
    GET /api/placements/my-academic-students/   — Academic supervisor.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    serializer_class   = PlacementSerializer

    @extend_schema(
        description='List placements where the logged-in user is the academic supervisor.',
        tags=['Placements — Academic Supervisor'],
    )
    def get_queryset(self):
        return Placement.objects.select_related(
            'student', 'workplace_supervisor', 'academic_supervisor', 'company'
        ).filter(academic_supervisor=self.request.user)