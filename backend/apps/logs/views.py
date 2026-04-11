from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import WeeklyLog, LogComment
from .serializers import (
    WeeklyLogSerializer,
    WeeklyLogCreateSerializer,
    WeeklyLogSubmitSerializer,
    WeeklyLogReviewSerializer,
    LogCommentCreateSerializer,
)
from apps.shared_permissions import (
    IsStudent,
    IsWorkplaceSupervisor,
    IsAcademicSupervisor,
    IsActiveUser,
    IsAdmin,
)
from apps.placements.models import Placement


# ─── Student: manage own logs ─────────────────────────────────────────────────

class StudentLogListCreateView(APIView):
    """
    GET  /api/logs/my/   — Student: list  own  logs
    POST /api/logs/my/   — Student: create a new draft log
    """
    permission_classes = [IsStudent]

    @extend_schema(
        responses={200: WeeklyLogSerializer(many=True)},
        description='List all weekly logs for the logged-in student.',
        tags=['Weekly Logs — Student'],
    )
    def get(self, request):
        logs = WeeklyLog.objects.filter(
            student=request.user
        ).prefetch_related('comments__author').order_by('-week_start')
        return Response(WeeklyLogSerializer(logs, many=True).data)

    @extend_schema(
        request=WeeklyLogCreateSerializer,
        responses={
            201: WeeklyLogSerializer,
            400: OpenApiResponse(description='Validation errors or no active placement'),
        },
        description=(
            'Create a new draft weekly log. '
            'Student must have an active placement. '
            'Each week number is unique per placement.'
        ),
        tags=['Weekly Logs — Student'],
    )
    def post(self, request):
        try:
            placement = Placement.objects.get(student=request.user, status='active')
        except Placement.DoesNotExist:
            return Response(
                {'detail': 'You do not have an active placement.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = WeeklyLogCreateSerializer(data=request.data)
        if serializer.is_valid():
            log = serializer.save(
                student=request.user,
                placement=placement,
                status='draft',
            )
            return Response(
                WeeklyLogSerializer(log).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentLogDetailView(APIView):
    """
    GET   /api/logs/my/<id>/   — Student: view a single log
    PATCH /api/logs/my/<id>/   — Student: edit a draft log
    """
    permission_classes = [IsStudent]

    def get_object(self, pk, student):
        try:
            return WeeklyLog.objects.prefetch_related('comments__author').get(
                pk=pk, student=student
            )
        except WeeklyLog.DoesNotExist:
            return None

    @extend_schema(
        responses={200: WeeklyLogSerializer},
        description='Get a specific weekly log for the logged-in student.',
        tags=['Weekly Logs — Student'],
    )
    def get(self, request, pk):
        log = self.get_object(pk, request.user)
        if not log:
            return Response({'detail': 'Log not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(WeeklyLogSerializer(log).data)

    @extend_schema(
        request=WeeklyLogCreateSerializer,
        responses={
            200: WeeklyLogSerializer,
            400: OpenApiResponse(description='Cannot edit a submitted or approved log'),
        },
        description='Update a draft log. Only allowed while status is "draft".',
        tags=['Weekly Logs — Student'],
    )
    def patch(self, request, pk):
        log = self.get_object(pk, request.user)
        if not log:
            return Response({'detail': 'Log not found.'}, status=status.HTTP_404_NOT_FOUND)
        if log.status not in ('draft', 'rejected'):
            return Response(
                {'detail': f'Cannot edit a log with status "{log.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = WeeklyLogCreateSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            # If re-editing a rejected log, move it back to draft
            serializer.save(status='draft')
            return Response(WeeklyLogSerializer(log).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentLogSubmitView(APIView):
    """
    POST /api/logs/my/<id>/submit/   — Student: submit a draft log for review
    """
    permission_classes = [IsStudent]

    @extend_schema(
        request=WeeklyLogSubmitSerializer,
        responses={
            200: OpenApiResponse(description='Log submitted successfully'),
            400: OpenApiResponse(description='Log is not in draft status'),
        },
        description='Submit a draft weekly log for supervisor review.',
        tags=['Weekly Logs — Student'],
    )
    def post(self, request, pk):
        try:
            log = WeeklyLog.objects.get(pk=pk, student=request.user)
        except WeeklyLog.DoesNotExist:
            return Response({'detail': 'Log not found.'}, status=status.HTTP_404_NOT_FOUND)

        if log.status != 'draft':
            return Response(
                {'detail': f'Only draft logs can be submitted. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        log.status       = 'submitted'
        log.submitted_at = timezone.now()
        log.save()
        return Response({'message': 'Log submitted for review.', 'status': log.status})


class StudentProgressView(APIView):
    """
    GET /api/logs/my/progress/   — Student: summary of all log statuses
    """
    permission_classes = [IsStudent]

    @extend_schema(
        responses={200: OpenApiResponse(description='Progress summary')},
        description='Get a summary of internship progress — log counts per status.',
        tags=['Weekly Logs — Student'],
    )
    def get(self, request):
        logs = WeeklyLog.objects.filter(student=request.user)
        summary = {
            'total':     logs.count(),
            'draft':     logs.filter(status='draft').count(),
            'submitted': logs.filter(status='submitted').count(),
            'reviewed':  logs.filter(status='reviewed').count(),
            'approved':  logs.filter(status='approved').count(),
            'rejected':  logs.filter(status='rejected').count(),
        }
        return Response(summary)


# ─── Workplace supervisor: review logs ────────────────────────────────────────

class WorkplaceLogListView(generics.ListAPIView):
    """
    GET /api/logs/supervisor/   — Workplace supervisor: see all logs for their students
    """
    permission_classes = [IsWorkplaceSupervisor]
    serializer_class   = WeeklyLogSerializer

    @extend_schema(
        description=(
            'List all weekly logs for students assigned to the logged-in workplace supervisor. '
            'Filter by ?status=submitted|reviewed|approved|rejected and/or ?student=<id>.'
        ),
        tags=['Weekly Logs — Workplace Supervisor'],
    )
    def get_queryset(self):
        # Get all placements where this user is the workplace supervisor
        placement_ids = Placement.objects.filter(
            workplace_supervisor=self.request.user
        ).values_list('id', flat=True)

        qs = WeeklyLog.objects.filter(
            placement_id__in=placement_ids
        ).select_related('student', 'placement').prefetch_related('comments__author')

        status_filter  = self.request.query_params.get('status')
        student_filter = self.request.query_params.get('student')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if student_filter:
            qs = qs.filter(student_id=student_filter)

        return qs.order_by('-week_start')


class WorkplaceLogReviewView(APIView):
    """
    POST /api/logs/supervisor/<id>/review/
    Workplace supervisor: approve or reject a submitted log, optionally adding a comment.
    """
    permission_classes = [IsWorkplaceSupervisor]

    @extend_schema(
        request=WeeklyLogReviewSerializer,
        responses={
            200: OpenApiResponse(description='Log reviewed'),
            400: OpenApiResponse(description='Log not in submitted status or not your student'),
            403: OpenApiResponse(description='Log does not belong to your student'),
        },
        description=(
            'Approve or reject a submitted weekly log. '
            'Optionally include a comment. '
            'Approve → status becomes "approved". '
            'Reject → status becomes "rejected" (student must revise).'
        ),
        tags=['Weekly Logs — Workplace Supervisor'],
    )
    def post(self, request, pk):
        try:
            log = WeeklyLog.objects.select_related('placement').get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response({'detail': 'Log not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify the log belongs to one of this supervisor's students
        if log.placement.workplace_supervisor != request.user:
            return Response(
                {'detail': 'This log does not belong to one of your assigned students.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if log.status != 'submitted':
            return Response(
                {'detail': f'Only submitted logs can be reviewed. Current status: {log.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = WeeklyLogReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action  = serializer.validated_data['action']
        comment = serializer.validated_data.get('comment', '').strip()

        log.status = 'approved' if action == 'approve' else 'rejected'
        log.save()

        if comment:
            LogComment.objects.create(log=log, author=request.user, comment=comment)

        return Response({
            'message': f'Log {log.status}.',
            'status':  log.status,
            'log_id':  log.id,
        })


class LogCommentCreateView(APIView):
    """
    POST /api/logs/<id>/comments/
    Workplace or academic supervisor: add a standalone comment to any log.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    @extend_schema(
        request=LogCommentCreateSerializer,
        responses={
            201: OpenApiResponse(description='Comment added'),
            403: OpenApiResponse(description='Not your student'),
        },
        description='Add a comment to a weekly log. Only supervisors assigned to that placement.',
        tags=['Weekly Logs — Comments'],
    )
    def post(self, request, pk):
        try:
            log = WeeklyLog.objects.select_related('placement').get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response({'detail': 'Log not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Must be an assigned supervisor or admin
        placement = log.placement
        user      = request.user
        allowed   = (
            user.role == 'admin' or
            (user.role == 'workplace_supervisor' and placement.workplace_supervisor == user) or
            (user.role == 'academic_supervisor'  and placement.academic_supervisor  == user)
        )
        if not allowed:
            return Response(
                {'detail': 'You are not assigned to this placement.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LogCommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(log=log, author=request.user)
            # Mark log as reviewed if it was approved/submitted
            if log.status in ('submitted', 'approved'):
                log.status = 'reviewed'
                log.save()
            return Response(
                {
                    'message':    'Comment added.',
                    'comment_id': comment.id,
                    'log_status': log.status,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Academic supervisor: monitor logs ────────────────────────────────────────

class AcademicLogListView(generics.ListAPIView):
    """
    GET /api/logs/academic/   — Academic supervisor: view all logs for their students
    """
    permission_classes = [IsAcademicSupervisor]
    serializer_class   = WeeklyLogSerializer

    @extend_schema(
        description='List all weekly logs for students assigned to the logged-in academic supervisor.',
        tags=['Weekly Logs — Academic Supervisor'],
    )
    def get_queryset(self):
        placement_ids = Placement.objects.filter(
            academic_supervisor=self.request.user
        ).values_list('id', flat=True)

        qs = WeeklyLog.objects.filter(
            placement_id__in=placement_ids
        ).select_related('student', 'placement').prefetch_related('comments__author')

        status_filter  = self.request.query_params.get('status')
        student_filter = self.request.query_params.get('student')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if student_filter:
            qs = qs.filter(student_id=student_filter)

        return qs.order_by('-week_start')


# ─── Admin: full log visibility ───────────────────────────────────────────────

class AdminLogListView(generics.ListAPIView):
    """
    GET /api/logs/admin/   — Admin: see all logs across the system
    """
    permission_classes = [IsAdmin]
    serializer_class   = WeeklyLogSerializer

    @extend_schema(
        description='List all weekly logs system-wide. Filter by ?status, ?student, ?placement.',
        tags=['Weekly Logs — Admin'],
    )
    def get_queryset(self):
        qs = WeeklyLog.objects.select_related(
            'student', 'placement'
        ).prefetch_related('comments__author')

        status_filter    = self.request.query_params.get('status')
        student_filter   = self.request.query_params.get('student')
        placement_filter = self.request.query_params.get('placement')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if student_filter:
            qs = qs.filter(student_id=student_filter)
        if placement_filter:
            qs = qs.filter(placement_id=placement_filter)

        return qs.order_by('-week_start')