from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = CustomUser
        fields = [
            'email',
            'full_name',
            'student_number',
            'role',
            'organisation',
            'password',
            'confirm_password',
        ]
        extra_kwargs = {
            'student_number': {'required': False},
            'organisation':   {'required': False},
        }

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError(
                'Admin accounts cannot be created through public registration.'
            )
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return value

    def validate_student_number(self, value):
        if not value:
            return value
        if CustomUser.objects.filter(student_number=value).exists():
            raise serializers.ValidationError(
                'This student number is already registered.'
            )
        return value

    def validate(self, data):
        # Passwords must match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        # Student number is required for students
        if data.get('role') == 'student' and not data.get('student_number'):
            raise serializers.ValidationError({
                'student_number': 'Student number is required for student accounts.'
            })

        # Non-students must not provide a student number
        if data.get('role') != 'student' and data.get('student_number'):
            raise serializers.ValidationError({
                'student_number': 'Only students should provide a student number.'
            })

        # Workplace supervisors should provide organisation
        if data.get('role') == 'workplace_supervisor' and not data.get('organisation'):
            raise serializers.ValidationError({
                'organisation': 'Organisation name is required for workplace supervisors.'
            })

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        # user.status = 'pending'
        # TEMPORARY: bypass admin approval during development/demo.
        user.status = 'active'
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])

        if not user:
            raise serializers.ValidationError(
                'Invalid email or password.'
            )

        # TEMPORARY: pending-status login gate is disabled while approval flow is bypassed.
        # if user.status == 'pending':
        #     raise serializers.ValidationError(
        #         'Your account is awaiting admin approval. Please wait.'
        #     )

        if user.status == 'rejected':
            raise serializers.ValidationError(
                'Your account has been rejected. Contact the administrator.'
            )

        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = [
            'id',
            'email',
            'full_name',
            'student_number',
            'role',
            'status',
            'organisation',
            'date_joined',
        ]
        read_only_fields = [
            'email',
            'student_number',
            'role',
            'status',
            'date_joined',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password     = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'New passwords do not match.'
            })
        return data
    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'No account found with this email address.'
            )
        return value


class ResetPasswordSerializer(serializers.Serializer):
    token            = serializers.UUIDField()
    new_password     = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return data