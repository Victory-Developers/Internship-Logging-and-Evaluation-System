from django.db import models
from django.conf import settings


class WeeklyLog(models.Model):
    """
    A weekly activity log submitted by a student.
    Lifecycle: draft → submitted → reviewed → approved (or rejected back to draft).
    """

    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed',  'Reviewed'),      # workplace superviso has commented
        ('approved',  'Approved'),      # workplace supervisor 
        ('rejected',  'Rejected'),     # sent back for revision
    ]

    placement    = models.ForeignKey(
                       'placements.Placement',
                       on_delete=models.CASCADE,
                       related_name='weekly_logs',
                   )
    student      = models.ForeignKey(
                       settings.AUTH_USER_MODEL,
                       on_delete=models.CASCADE,
                       related_name='weekly_logs',
                       limit_choices_to={'role': 'student'},
                   ) # Minor change here

    week_number  = models.PositiveSmallIntegerField(
                       help_text='Which week of the internship (1, 2, 3 …)'
                   )
    week_start   = models.DateField()
    week_end     = models.DateField()

    activities   = models.TextField(
                       help_text='What the student did this week'
                   )
    learning     = models.TextField(
                       blank=True,
                       help_text='Key learning outcomes'
                   )
    challenges   = models.TextField(
                       blank=True,
                       help_text='Challenges faced'
                   )
    next_week    = models.TextField(
                       blank=True,
                       help_text='Plans for next week'
                   )

    status       = models.CharField(
                       max_length=20,
                       choices=STATUS_CHOICES,
                       default='draft',
                   )

    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-week_start']
        unique_together     = ('placement', 'week_number')
        verbose_name        = 'Weekly log'
        verbose_name_plural = 'Weekly logs'

    def __str__(self):
        return f'Week {self.week_number} — {self.student.full_name} ({self.status})'


class LogComment(models.Model):
    """
    A comment left by a workplace or academic supervisor on a weekly log.
    """

    ROLE_CHOICES = [
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor',  'Academic Supervisor'),
    ]

    log          = models.ForeignKey(
                       WeeklyLog,
                       on_delete=models.CASCADE,
                       related_name='comments',
                   )
    author       = models.ForeignKey(
                       settings.AUTH_USER_MODEL,
                       on_delete=models.CASCADE,
                       related_name='log_comments',
                   )
    comment      = models.TextField()
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author.full_name} on {self.log}'
