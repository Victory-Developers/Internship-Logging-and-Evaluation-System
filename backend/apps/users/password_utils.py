import resend
from django.conf import settings
from .models import PasswordResetToken

resend.api_key = settings.RESEND_API_KEY

def generate_and_send_token(user):
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    reset_token = PasswordResetToken.objects.create(user=user)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"

    resend.Emails.send({
        "from": "ILES <onboarding@resend.dev>",
        "to": [user.email],
        "subject": "ILES Password Reset Request",
        "text": (
            f'Hi {user.full_name},\n\n'
            f'You requested a password reset for your ILES account.\n\n'
            f'Use this link to reset your password:\n{reset_url}\n\n'
            f'This link expires in 30 minutes.\n\n'
            f'If you did not request this, please ignore this email.'
        )
    })