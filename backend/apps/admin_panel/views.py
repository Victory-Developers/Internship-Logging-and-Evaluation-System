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

from django.core.mail import send_mail             
from django.conf import settings   

from django_filters.rest_framework import DjangoFilterBackend                                                                                                                        
from rest_framework.filters import SearchFilter, OrderingFilter                                                                                                                                                 
import logging                                                                                                                                                                       
                                                    
logger = logging.getLogger(__name__)

# moduless....

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

class PendingUsersCountView(APIView):                                                                                                                                                
    """                                                                      
    GET /api/admin/users/pending/count/   — Admin: count of pending-approval users                                                                                                   
    """                                                                      
    permission_classes = [IsAdmin]                                                                                                                                                   
                            
    @extend_schema(                                                                                                                                                                  
        responses={200: OpenApiResponse(description='{"count": <int>}')},    
        description='Returns just the count of users awaiting approval. Used for the admin notification badge.',                                                                     
        tags=['Admin — User Management'],                                    
    )                                                            
    def get(self, request):                                                                                                                                                          
        count = CustomUser.objects.filter(status='pending').count()
        return Response({'count': count})  

class ApproveUserView(APIView):
    """
    POST /api/admin/users/<id>/approve/   — Admin: approve a pending user
    """
    permission_classes = [IsAdmin]
    # Checked whether permissions are working or not...

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
                                        
        try:                                                                                                                                                                         
            send_mail(                                                       
                subject='Your ILES account has been approved',                                                                                                                       
                message=(   
                    f'Hello {user.full_name},\n\n'                                                                                                                                   
                    f'Your ILES (Internship Logging & Evaluation System) account has been approved.\n'
                    f'You can now log in at: {settings.FRONTEND_LOGIN_URL}\n\n'
                    f'Email used: {user.email}\n\n'
                    f'— ILES Team'                                                                                                                                                   
                ),                                               
                from_email=settings.DEFAULT_FROM_EMAIL,                                                                                                                              
                recipient_list=[user.email],                                 
                fail_silently=False,                                                                                                                                                 
            )                                      
        except Exception as e:                                                                                                                                                       
            logger.warning(f'Approval email failed for {user.email}: {e}')                                                                                                           
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
                                        
        try:                                       
            send_mail(                   
                subject='Update on your ILES account application',                                                                                                                   
                message=(              
                    f'Hello {user.full_name},\n\n'                                                                                                                                   
                    f'Thank you for registering with ILES (Internship Logging & Evaluation System). '
                    f'Unfortunately, your account application was not approved at this time.\n\n'                                                                                    
                    f'If you believe this is an error, please contact your administrator.\n\n'
                    f'— ILES Team'                               
                ),                                               
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],                                                                                                                                         
                fail_silently=False,               
            )
        except Exception as e:                                                                                                                                                                        
            logger.warning(f'Rejection email failed for {user.email}: {e}')                                                                                                          
                                                                                                                                                                                  
        return Response({                                                                                                                                                            
            'message': f'{user.full_name} has been rejected.',                                                                                                                       
            'user_id': user.id,                                              
            'status':  user.status,                                                                                                                                                  
        })   


class AllUsersView(generics.ListAPIView):
    """
    GET /api/admin/users/   — Admin: list all users with pagination, search, and filters
    """
    permission_classes = [IsAdmin]
    serializer_class   = UserProfileSerializer
    queryset           = CustomUser.objects.all()

    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]                                                                                                         
    filterset_fields   = ['role', 'status']
    search_fields      = ['email', 'full_name', 'student_number']                                                                                                                    
    ordering_fields    = ['date_joined', 'full_name', 'role']                
    ordering           = ['-date_joined']

    @extend_schema(                                                                                                                                                                  
        description=(                                                                                                                                                                
            'List all users with pagination. '
            'Filter by ?role=&status=. '                                                                                                                                             
            'Order with ?ordering=date_joined or -date_joined.'                                                                                                                      
        ),                                                     
        tags=['Admin — User Management'],                                                                                                                                            
    )                                                                        
    def get(self, request, *args, **kwargs):                                                                                                                                         
        return super().get(request, *args, **kwargs) 


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

        # Pending log reviews (submitted but not yet reviewed)...
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


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardView(APIView):
    """
    GET /api/admin/dashboard/   — Admin: dashboard statistics and recent activity
    """
    permission_classes = [IsAdmin] # admin commit check

    @extend_schema(
        responses={200: OpenApiResponse(description='Dashboard data')},
        description='Get dashboard statistics and recent activity for admin overview.',
        tags=['Admin — Dashboard'],
    )
    def get(self, request):
        # Stats
        total_students = CustomUser.objects.filter(role='student', status='active').count()
        total_supervisors = CustomUser.objects.filter(
            Q(role='academic_supervisor') | Q(role='workplace_supervisor'),
            status='active'
        ).count()
        total_placements = Placement.objects.count()
        pending_users = CustomUser.objects.filter(status='pending').count()

        # Recent activity (last 10 items)
        recent_activity = []

        # Recent placements
        recent_placements = Placement.objects.order_by('-created_at')[:5]
        for p in recent_placements:
            recent_activity.append({
                'description': f'New placement created for {p.student.full_name} at {p.company_name}',
                'time': p.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        # Recent logs
        recent_logs = WeeklyLog.objects.order_by('-submitted_at')[:5]
        for log in recent_logs:
            recent_activity.append({
                'description': f'Weekly log submitted by {log.student.full_name}',
                'time': log.submitted_at.strftime('%Y-%m-%d %H:%M') if log.submitted_at else 'N/A',
            })

        # Sort by time descending...
        recent_activity.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = recent_activity[:10]  # Limit to 10

        return Response({
            'stats': {
                'total_students': total_students,
                'total_supervisors': total_supervisors,
                'total_placements': total_placements,
                'pending_users': pending_users,
            },
            'recent_activity': recent_activity,
        })
    
    #...