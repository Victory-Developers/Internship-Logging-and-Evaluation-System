from django.core.mail import send_mail
from django.conf import settings
from .models import PasswordResetToken
import traceback


def generate_and_send_token(user):
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    reset_token = PasswordResetToken.objects.create(user=user)

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
    
    try:
        send_mail(
            'ILES Password Reset Request',
            f'Hi {user.full_name},\n\n'
            f'You requested a password reset for your ILES account.\n\n'
            f'Use this link to reset your password:\n{reset_url}\n\n'
            f'This link expires in 30 minutes.\n\n'
            f'If you did not request this, please ignore this email.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        traceback.print_exc()
        raise