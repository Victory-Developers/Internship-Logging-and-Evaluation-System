import base64
from email.mime.text import MIMEText

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from django.conf import settings
from .models import PasswordResetToken


def get_gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=settings.GMAIL_REFRESH_TOKEN,
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        token_uri='https://oauth2.googleapis.com/token',
    )
    creds.refresh(Request())
    return build('gmail', 'v1', credentials=creds)


def generate_and_send_token(user):
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    reset_token = PasswordResetToken.objects.create(user=user)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"

    body = (
        f"Hi {user.full_name},\n\n"
        f"You requested a password reset for your ILES account.\n\n"
        f"Use this link to reset your password:\n{reset_url}\n\n"
        f"This link expires in 30 minutes.\n\n"
        f"If you did not request this, please ignore this email."
    )

    message = MIMEText(body)
    message['to'] = user.email
    message['subject'] = 'ILES Password Reset Request'
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    service = get_gmail_service()
    service.users().messages().send(userId='me', body={'raw': raw}).execute()