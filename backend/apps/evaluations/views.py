from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from decimal import Decimal

from .models import WorkplaceEvaluation, AcademicEvaluation
from .serializers import (
    WorkplaceEvaluationSerializer,
    WorkplaceEvaluationCreateSerializer,
    AcademicEvaluationSerializer,
    AcademicEvaluationCreateSerializer,
    ScoresOverviewSerializer,
)
from apps.shared_permissions import (
    IsStudent,
    IsWorkplaceSupervisor,
    IsAcademicSupervisor,
    IsAdmin,
)
from apps.placements.models import Placement


# ─── Workplace supervisor: evaluate students ──────────────────────────────────

class WorkplaceEvaluationListCreateView(APIView):
    """
    GET  /api/evaluations/workplace/   — WP supervisor: list all own evaluations
    POST /api/evaluations/workplace/   — WP supervisor: create evaluation
    """
    permission_classes = [IsWorkplaceSupervisor]

    @extend_schema(
        responses={200: WorkplaceEvaluationSerializer(many=True)},
        description='List all evaluations submitted by the logged-in workplace supervisor.',
        tags=['Evaluations — Workplace Supervisor'],
    )
    def get(self, request):
        evals = WorkplaceEvaluation.objects.filter(
            supervisor=request.user
        ).select_related('placement__student')
        return Response(WorkplaceEvaluationSerializer(evals, many=True).data)

    @extend_schema(
        request=WorkplaceEvaluationCreateSerializer,
        responses={
            201: WorkplaceEvaluationSerializer,
            400: OpenApiResponse(description='Validation error or duplicate'),
        },
        description=(
            'Submit a performance evaluation for an assigned student. '
            'Criteria: professionalism, technical skills, communication, punctuality (each 0–10).'
        ),
        tags=['Evaluations — Workplace Supervisor'],
    )
    def post(self, request):
        serializer = WorkplaceEvaluationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            evaluation = serializer.save(supervisor=request.user)
            return Response(
                WorkplaceEvaluationSerializer(evaluation).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkplaceEvaluationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/evaluations/workplace/<id>/
    PATCH /api/evaluations/workplace/<id>/
    """
    permission_classes = [IsWorkplaceSupervisor]

    def get_queryset(self):
        return WorkplaceEvaluation.objects.filter(supervisor=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return WorkplaceEvaluationCreateSerializer
        return WorkplaceEvaluationSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @extend_schema(tags=['Evaluations — Workplace Supervisor'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Evaluations — Workplace Supervisor'],
        description='Update an existing workplace evaluation (partial update).',
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# ─── Academic supervisor: evaluate students ───────────────────────────────────

class AcademicEvaluationListCreateView(APIView):
    """
    GET  /api/evaluations/academic/
    POST /api/evaluations/academic/
    """
    permission_classes = [IsAcademicSupervisor]

    @extend_schema(
        responses={200: AcademicEvaluationSerializer(many=True)},
        description='List all evaluations submitted by the logged-in academic supervisor.',
        tags=['Evaluations — Academic Supervisor'],
    )
    def get(self, request):
        evals = AcademicEvaluation.objects.filter(
            supervisor=request.user
        ).select_related('placement__student')
        return Response(AcademicEvaluationSerializer(evals, many=True).data)

    @extend_schema(
        request=AcademicEvaluationCreateSerializer,
        responses={
            201: AcademicEvaluationSerializer,
            400: OpenApiResponse(description='Validation error or duplicate'),
        },
        description=(
            'Submit an academic evaluation for an assigned student. '
            'Criteria: quality of work, internship report, problem solving, learning outcomes (each 0–10).'
        ),
        tags=['Evaluations — Academic Supervisor'],
    )
    def post(self, request):
        serializer = AcademicEvaluationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            evaluation = serializer.save(supervisor=request.user)
            return Response(
                AcademicEvaluationSerializer(evaluation).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcademicEvaluationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/evaluations/academic/<id>/
    PATCH /api/evaluations/academic/<id>/
    """
    permission_classes = [IsAcademicSupervisor]

    def get_queryset(self):
        return AcademicEvaluation.objects.filter(supervisor=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return AcademicEvaluationCreateSerializer
        return AcademicEvaluationSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @extend_schema(tags=['Evaluations — Academic Supervisor'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Evaluations — Academic Supervisor'])
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# ─── Student: view own scores ─────────────────────────────────────────────────

class StudentScoresView(APIView):
    """
    GET /api/evaluations/my-scores/   — Student: see own evaluation scores
    """
    permission_classes = [IsStudent]

    @extend_schema(
        responses={200: OpenApiResponse(description='Student\'s scores from both supervisors')},
        description='Get the logged-in student\'s scores from workplace and academic supervisors.',
        tags=['Evaluations — Student'],
    )
    def get(self, request):
        try:
            placement = Placement.objects.get(student=request.user)
        except Placement.DoesNotExist:
            return Response(
                {'detail': 'No placement found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        wp_eval = WorkplaceEvaluation.objects.filter(placement=placement).first()
        ac_eval = AcademicEvaluation.objects.filter(placement=placement).first()

        wp_avg = wp_eval.average_score if wp_eval else None
        ac_avg = ac_eval.average_score if ac_eval else None

        if wp_avg and ac_avg:
            combined = (wp_avg + ac_avg) / 2
        elif wp_avg:
            combined = wp_avg
        elif ac_avg:
            combined = ac_avg
        else:
            combined = None

        return Response({
            'student_name':         request.user.full_name,
            'company_name':         placement.company_name,
            'placement_status':     placement.status,
            'workplace_avg':        wp_avg,
            'academic_avg':         ac_avg,
            'combined_avg':         combined,
            'workplace_evaluation': WorkplaceEvaluationSerializer(wp_eval).data if wp_eval else None,
            'academic_evaluation':  AcademicEvaluationSerializer(ac_eval).data  if ac_eval else None,
        })


# ─── Admin & Academic supervisor: scores overview ─────────────────────────────

def _build_scores_overview(placements_qs):
    """Helper — build scores overview data for a queryset of placements."""
    results = []
    for placement in placements_qs:
        wp_eval = WorkplaceEvaluation.objects.filter(placement=placement).first()
        ac_eval = AcademicEvaluation.objects.filter(placement=placement).first()

        wp_avg = wp_eval.average_score if wp_eval else None
        ac_avg = ac_eval.average_score if ac_eval else None

        if wp_avg and ac_avg:
            combined = (Decimal(str(wp_avg)) + Decimal(str(ac_avg))) / 2
        elif wp_avg:
            combined = Decimal(str(wp_avg))
        elif ac_avg:
            combined = Decimal(str(ac_avg))
        else:
            combined = None

        results.append({
            'student_name':         placement.student.full_name,
            'student_number':       placement.student.student_number or '',
            'company_name':         placement.company_name,
            'placement_status':     placement.status,
            'workplace_avg':        wp_avg,
            'academic_avg':         ac_avg,
            'combined_avg':         combined,
            'workplace_evaluation': wp_eval,
            'academic_evaluation':  ac_eval,
        })
    return results


class AdminScoresOverviewView(APIView):
    """
    GET /api/evaluations/admin/scores/   — Admin: all students' scores
    """
    permission_classes = [IsAdmin]

    @extend_schema(
        responses={200: OpenApiResponse(description='Scores overview for all placements')},
        description='Get scores overview for every placement in the system.',
        tags=['Evaluations — Admin'],
    )
    def get(self, request):
        placements = Placement.objects.select_related('student')
        data = _build_scores_overview(placements)
        return Response(data)


class AcademicScoresOverviewView(APIView):
    """
    GET /api/evaluations/academic/scores/   — Academic supervisor: scores for own students
    """
    permission_classes = [IsAcademicSupervisor]

    @extend_schema(
        responses={200: OpenApiResponse(description='Scores for assigned students')},
        description='Get scores overview for all students assigned to the logged-in academic supervisor.',
        tags=['Evaluations — Academic Supervisor'],
    )
    def get(self, request):
        placements = Placement.objects.select_related('student').filter(
            academic_supervisor=request.user
        )
        data = _build_scores_overview(placements)
        return Response(data)


# ─── Academic Supervisor Dashboard ────────────────────────────────────────────

class AcademicSupervisorDashboardView(APIView):
    """
    GET /api/evaluations/academic/dashboard/   — Academic supervisor: dashboard stats
    """
    permission_classes = [IsAcademicSupervisor]

    @extend_schema(
        responses={200: OpenApiResponse(description='Dashboard data')},
        description='Get dashboard statistics and recent activity for academic supervisor overview.',
        tags=['Evaluations — Academic Supervisor'],
    )
    def get(self, request):
        from apps.logs.models import WeeklyLog
        
        # Stats
        total_students = Placement.objects.filter(
            academic_supervisor=request.user,
            status='active'
        ).values('student').distinct().count()
        
        pending_reviews = WeeklyLog.objects.filter(
            placement__academic_supervisor=request.user,
            status='submitted'
        ).count()
        
        completed_evaluations = AcademicEvaluation.objects.filter(
            placement__academic_supervisor=request.user
        ).count()
        
        active_placements = Placement.objects.filter(
            academic_supervisor=request.user,
            status='active'
        ).count()

        # Recent activity (last 10 items)
        recent_activity = []

        # Recent evaluations
        recent_evals = AcademicEvaluation.objects.filter(
            placement__academic_supervisor=request.user
        ).select_related('placement__student').order_by('-created_at')[:5]
        
        for eval in recent_evals:
            recent_activity.append({
                'description': f'Academic evaluation completed for {eval.placement.student.full_name}',
                'time': eval.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        # Recent logs submitted
        recent_logs = WeeklyLog.objects.filter(
            placement__academic_supervisor=request.user,
            status='submitted'
        ).select_related('student').order_by('-submitted_at')[:5]
        
        for log in recent_logs:
            recent_activity.append({
                'description': f'Weekly log submitted by {log.student.full_name} (Week {log.week_number})',
                'time': log.submitted_at.strftime('%Y-%m-%d %H:%M') if log.submitted_at else 'N/A',
            })

        # Sort by time descending
        recent_activity.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = recent_activity[:10]  # Limit to 10

        return Response({
            'stats': {
                'total_students': total_students,
                'pending_reviews': pending_reviews,
                'completed_evaluations': completed_evaluations,
                'active_placements': active_placements,
            },
            'recent_activity': recent_activity,
        })