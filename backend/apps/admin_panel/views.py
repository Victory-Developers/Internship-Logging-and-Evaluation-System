from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db.models import Count, Q

from apps.shared_permissions import IsAdmin
from apps.users.models import CustomUser
from apps.users.serializers import UserProfileSerializer
from apps.placements.models import Placement
from apps.logs.models import WeeklyLog
from apps.evaluations.models import WorkplaceEvaluation, AcademicEvaluation


# ─── User management ──────────────────────────────────────────────────────────

class PendingUsersView(generics.ListAPIView):
    """
    GET /api/admin/users/pending/   — Admin: list all accounts awaiting approval
    """
    permission_classes = [IsAdmin]
    serializer_class   = UserProfileSerializer

    @extend_schema(
        description='List all user accounts with status "pending".',
        tags=['Admin — User Management'],
    )
    def get_queryset(self):
        return CustomUser.objects.filter(status='pending').order_by('date_joined')


class ApproveUserView(APIView):
    """
    POST /api/admin/users/<id>/approve/   — Admin: approve a pending user
    """
    permission_classes = [IsAdmin]
    # Checked whether permissions are working or not

    @extend_schema(
        responses={
            200: OpenApiResponse(description='User approved'),
            404: OpenApiResponse(description='User not found'),
            400: OpenApiResponse(description='User is not pending'),
        },
        description='Approve a pending user account. Sets status to "active".',
        tags=['Admin — User Management'],
    )
    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.status != 'pending':
            return Response(
                {'detail': f'User status is already "{user.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.status = 'active'
        user.save()
        return Response({
            'message':  f'{user.full_name} has been approved.',
            'user_id':  user.id,
            'email':    user.email,
            'role':     user.role,
            'status':   user.status,
        })


class RejectUserView(APIView):
    """
    POST /api/admin/users/<id>/reject/   — Admin: reject a pending user
    """
    permission_classes = [IsAdmin]

    @extend_schema(
        responses={
            200: OpenApiResponse(description='User rejected'),
            404: OpenApiResponse(description='User not found'),
        },
        description='Reject a user account. Sets status to "rejected".',
        tags=['Admin — User Management'],
    )
    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.status = 'rejected'
        user.save()
        return Response({
            'message': f'{user.full_name} has been rejected.',
            'user_id': user.id,
            'status':  user.status,
        })


class AllUsersView(generics.ListAPIView):
    """
    GET /api/admin/users/   — Admin: list all users with optional role filter
    """
    permission_classes = [IsAdmin]
    serializer_class   = UserProfileSerializer

    @extend_schema(
        description='List all users. Filter by ?role=student|workplace_supervisor|academic_supervisor|admin and/or ?status=pending|active|rejected.',
        tags=['Admin — User Management'],
    )
    def get_queryset(self):
        qs            = CustomUser.objects.all().order_by('role', 'full_name')
        role_filter   = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')
        if role_filter:
            qs = qs.filter(role=role_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


# ─── System reports ───────────────────────────────────────────────────────────

class SystemReportView(APIView):
    """
    GET /api/admin/reports/   — Admin: high-level system statistics
    """
    permission_classes = [IsAdmin]

    @extend_schema(
        responses={200: OpenApiResponse(description='System statistics')},
        description='Get system-wide statistics: user counts, placement status, log activity, evaluation completion.',
        tags=['Admin — Reports'],
    )
    def get(self, request):
        # Users
        users = CustomUser.objects.values('role', 'status').annotate(count=Count('id'))
        user_stats = {}
        for row in users:
            role   = row['role']
            s      = row['status']
            count  = row['count']
            if role not in user_stats:
                user_stats[role] = {'pending': 0, 'active': 0, 'rejected': 0, 'total': 0}
            user_stats[role][s]       += count
            user_stats[role]['total'] += count

        # Placements
        placement_counts = Placement.objects.values('status').annotate(count=Count('id'))
        placement_stats  = {row['status']: row['count'] for row in placement_counts}

        # Logs
        log_counts = WeeklyLog.objects.values('status').annotate(count=Count('id'))
        log_stats  = {row['status']: row['count'] for row in log_counts}
        log_stats['total'] = sum(log_stats.values())

        # Pending log reviews (submitted but not yet reviewed)
        pending_reviews = WeeklyLog.objects.filter(status='submitted').count()

        # Evaluations
        total_placements      = Placement.objects.count()
        wp_eval_done          = WorkplaceEvaluation.objects.count()
        ac_eval_done          = AcademicEvaluation.objects.count()
        both_evals_done       = Placement.objects.filter(
            workplace_evaluations__isnull=False,
            academic_evaluations__isnull=False,
        ).distinct().count()

        return Response({
            'users':       user_stats,
            'placements':  {
                **placement_stats,
                'total': sum(placement_stats.values()),
            },
            'weekly_logs': {
                **log_stats,
                'pending_supervisor_review': pending_reviews,
            },
            'evaluations': {
                'total_placements':          total_placements,
                'workplace_eval_submitted':  wp_eval_done,
                'academic_eval_submitted':   ac_eval_done,
                'both_evals_complete':       both_evals_done,
                'completion_rate_pct': (
                    round(both_evals_done / total_placements * 100, 1)
                    if total_placements else 0
                ),
            },
        })