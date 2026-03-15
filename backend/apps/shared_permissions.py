from rest_framework.permissions import BasePermission
＃ Checked and verified

class IsActiveUser(BasePermission):
    """Reject pending/rejected accounts."""
    message = 'Your account is not yet approved.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.status == 'active'
        )


class IsStudent(BasePermission):
    message = 'Only students can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'student' and
            request.user.status == 'active'
        )


class IsWorkplaceSupervisor(BasePermission):
    message = 'Only workplace supervisors can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'workplace_supervisor' and
            request.user.status == 'active'
        )


class IsAcademicSupervisor(BasePermission):
    message = 'Only academic supervisors can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'academic_supervisor' and
            request.user.status == 'active'
        )


class IsAdmin(BasePermission):
    message = 'Only administrators can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.status == 'active'
        )


class IsAdminOrReadOnly(BasePermission):
    """Admin can write; authenticated active users can read."""

    def has_permission(self, request, view):
        if not (request.user.is_authenticated and request.user.status == 'active'):
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.role == 'admin'


class IsSupervisorOrAdmin(BasePermission):
    """Workplace supervisor, academic supervisor, or admin."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.status == 'active' and
            request.user.role in (
                'workplace_supervisor',
                'academic_supervisor',
                'admin',
            )
        )
