from django.db import models
from django.conf import settings

class Company(models.Model):
    """A company where students can do their internship."""

    name       = models.CharField(max_length=255)
    address    = models.TextField(blank=True)
    email      = models.EmailField(blank=True)
    phone      = models.CharField(max_length=30, blank=True)
    website    = models.URLField(blank=True)
    created_by = models.ForeignKey(
                     settings.AUTH_USER_MODEL,
                     on_delete=models.SET_NULL,
                     null=True,
                     blank=True,
                     related_name='created_companies',
                 )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name

class Placement(models.Model):
    """
    Represents one student's internship placement.
    Created by Admin or submitted by STudent (pending approval).
    """

    STATUS_CHOICES = [
        ('pending',   'Pending')
        ('active',    'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    student              = models.OneToOneField(
                              settings.AUTH_USER_MODEL,
                              on_delete=models.CASCADE,
                              related_name='placement',
                              limit_choices_to={'role': 'student'},
                          )
    workplace_supervisor = models.ForeignKey(
                              settings.AUTH_USER_MODEL,
                              on_delete=models.SET_NULL,
                              null=True,
                              blank=True,
                              related_name='supervised_placements',
                              limit_choices_to={'role': 'workplace_supervisor'},
                          )
    academic_supervisor  = models.ForeignKey(
                              settings.AUTH_USER_MODEL,
                              on_delete=models.SET_NULL,
                              null=True,
                              blank=True,
                              related_name='academic_placements',
                              limit_choices_to={'role': 'academic_supervisor'},
                          )
    
    company              = models.ForeignKey(
                            Company,
                            on_delete=models.SET_NULL,
                            null=True,
                            blank=True,
                            related_name='placements',
                        )

    company_name         = models.CharField(max_length=255)
    company_address      = models.TextField(blank=True)
    job_title            = models.CharField(max_length=255, blank=True)
    description          = models.TextField(blank=True)

    start_date           = models.DateField()
    end_date             = models.DateField()
    weekly_log_deadline  = models.PositiveSmallIntegerField(
                              default=5,
                              help_text='Day of week logs are due (1=Mon ... 7=Sun)'
                          )

    status               = models.CharField(
                              max_length=20,
                              choices=STATUS_CHOICES,
                              default='active'
                          )
    
    invited_supervisor_email = models.EmailField(
                                  blank=True,
                                  help_text='Email of invited workplace supervisor (not yet registered)'
                              )    

    created_by           = models.ForeignKey(
                              settings.AUTH_USER_MODEL,
                              on_delete=models.SET_NULL,
                              null=True,
                              related_name='created_placements',
                          )
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student.full_name} @ {self.company_name}'