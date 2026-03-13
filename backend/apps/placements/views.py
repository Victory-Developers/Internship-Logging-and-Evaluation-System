from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import Placement
from .serializers import PlacementSerializer, PlacementCreateSerializer
from apps.shared_permissions import IsAdmin, IsStudent, IsActiveUser


# ─── Admin:full CRUD ─────────────────────────────────────────────────────────

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

    def get_queryset(self):
        qs = Placement.objects.select_related(
            'student', 'workplace_supervisor', 'academic_supervisor', 'created_by'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @extend_schema(
        description='List all internship placements. Filter by ?status=active|completed|cancelled.',
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
        'student', 'workplace_supervisor', 'academic_supervisor', 'created_by'
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


# ─── Student: view own placement ──────────────────────────────────────────────

class MyPlacementView(APIView):
    """
    GET /api/placements/my/   — Student: get own placement details.
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
                'student', 'workplace_supervisor', 'academic_supervisor'
            ).get(student=request.user)
        except Placement.DoesNotExist:
            return Response(
                {'detail': 'You have not been assigned a placement yet.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(PlacementSerializer(placement).data)


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
            'student', 'workplace_supervisor', 'academic_supervisor'
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
            'student', 'workplace_supervisor', 'academic_supervisor'
        ).filter(academic_supervisor=self.request.user)