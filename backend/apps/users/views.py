from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import CustomUser, PasswordResetToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from apps.shared_permissions import IsStudent


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description='Registration successful, awaiting admin approval'),
            400: OpenApiResponse(description='Validation errors'),
        },
        description=(
            'Register a new account. '
            'Students must provide student_number. '
            'Workplace supervisors must provide organisation. '
            'All accounts start as pending until admin approves.'
        ),
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'Account created successfully. Please wait for admin approval before logging in.',
                    'email':   user.email,
                    'role':    user.role,
                    'status':  user.status,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description='Login successful — returns access and refresh tokens'),
            400: OpenApiResponse(description='Invalid credentials or account not yet approved'),
        },
        description=(
            'Login with email and password. '
            'Returns a JWT access token (valid 12 hours) and refresh token (valid 7 days). '
            'Copy the access token and use it in the Authorize button at the top of this page.'
        ),
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user    = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    'access':  str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id':             user.id,
                        'email':          user.email,
                        'full_name':      user.full_name,
                        'student_number': user.student_number,
                        'role':           user.role,
                        'status':         user.status,
                    },
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class   = UserProfileSerializer

    @extend_schema(
        description='Get the profile of the currently logged-in user.',
        tags=['Authentication'],
    )
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description='Password changed successfully'),
            400: OpenApiResponse(description='Old password wrong or new passwords do not match'),
        },
        description='Change password for the currently logged-in user.',
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Old password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'message': 'Password changed successfully. Please log in again.'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        description='Logout by blacklisting the refresh token. Pass your refresh token in the body.',
        tags=['Authentication'],
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid or already blacklisted token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=ForgotPasswordSerializer,
        responses={
            200: OpenApiResponse(description='Reset token generated successfully'),
            400: OpenApiResponse(description='Email not found'),
        },
        description=(
            'Send your email to receive a password reset token. '
            'In production this token is emailed to you. '
            'For testing, the token is returned directly in the response.'
        ),
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user  = CustomUser.objects.get(email=email)

            # Delete any old unused tokens for this user
            PasswordResetToken.objects.filter(
                user=user,
                is_used=False
            ).delete()

            # Create a new token
            reset_token = PasswordResetToken.objects.create(user=user)

            return Response(
                {
                    'message': 'Password reset token generated. '
                               'In production this would be sent to your email.',
                    'token':   str(reset_token.token),
                    'expires': '30 minutes',
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(description='Password reset successfully'),
            400: OpenApiResponse(description='Invalid or expired token'),
        },
        description=(
            'Use the token from the forgot-password endpoint to set a new password. '
            'Token expires after 30 minutes. '
            'Token can only be used once.'
        ),
        tags=['Authentication'],
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token_value  = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token_value,
                    is_used=False
                )
            except PasswordResetToken.DoesNotExist:
                return Response(
                    {'error': 'Invalid or already used reset token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if reset_token.is_expired():
                reset_token.delete()
                return Response(
                    {'error': 'Reset token has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = reset_token.user
            user.set_password(new_password)
            user.save()

            reset_token.is_used = True
            reset_token.save()

            return Response(
                {'message': 'Password reset successfully. You can now login with your new password.'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class InviteSupervisorView(APIView):
    """
    POST /api/auth/invite/  — Student invites a workplace supervisor by email.
    If the user already exists and is a workplace_supervisor, returns their info.
    Otherwise returns a registration link.
    """
    permission_classes = [IsStudent]

    @extend_schema(
        description='Invite a workplace supervisor by email.',
        tags=['Authentication'],
    )
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response(
                {'email': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            existing = CustomUser.objects.get(email=email)
            if existing.role == 'workplace_supervisor' and existing.status == 'active':
                return Response({
                    'status': 'existing',
                    'user': {
                        'id': existing.id,
                        'full_name': existing.full_name,
                        'email': existing.email,
                    },
                    'message': f'{existing.full_name} is already registered as a workplace supervisor.',
                })
            elif existing.role == 'workplace_supervisor':
                return Response({
                    'status': 'pending',
                    'message': f'{existing.full_name} has registered but is awaiting admin approval.',
                })
            else:
                return Response({
                    'status': 'wrong_role',
                    'message': 'A user with this email exists but is not a workplace supervisor.',
                }, status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({
                'status': 'invited',
                'message': f'Invitation sent. They can register at /register?email={email}&role=workplace_supervisor',
                'registration_link': f'/register?email={email}&role=workplace_supervisor',
            })