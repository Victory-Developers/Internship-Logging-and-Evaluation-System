from django.contrib import admin
from .models import Company, Placement

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ('student', 'company_name', 'job_title', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('student__full_name', 'company_name', 'job_title')