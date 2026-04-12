from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display   = ['email', 'full_name', 'student_number', 'role', 'status', 'date_joined']
    list_filter    = ['role', 'status']
    search_fields  = ['email', 'full_name', 'student_number']
    ordering       = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'student_number', 'organisation')}),
        ('Role & Status', {'fields': ('role', 'status')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'student_number', 'role', 'organisation', 'status', 'password1', 'password2'),
        }),
    ) # Comment needed here