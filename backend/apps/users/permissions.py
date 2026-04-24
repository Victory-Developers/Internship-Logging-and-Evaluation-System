from rest_framework.permissions import BasePermission


class IsStudent(BasePermission): # Student permission
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'student' and
            request.user.status == 'active'
        )


class IsWorkplaceSupervisor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'workplace_supervisor' and
            request.user.status == 'active'
        )


class IsAcademicSupervisor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'academic_supervisor' and
            request.user.status == 'active'
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.status == 'active'
        )