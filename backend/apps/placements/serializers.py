from rest_framework import serializers
from .models import Company, Placement
from apps.users.models import CustomUser


class UserBriefSerializer(serializers.ModelSerializer):
    """Minimal user info embedded in placement responses."""

    class Meta:
        model  = CustomUser
        fields = ['id', 'full_name', 'email', 'role', 'student_number', 'organisation']

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Company
        fields = ['id', 'name', 'address', 'email', 'phone', 'website', 'created_at']
        read_only_fields = ['id', 'created_at']


class CompanySearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for autocomplete."""

    class Meta:
        model  = Company
        fields = ['id', 'name', 'address']

class PlacementSerializer(serializers.ModelSerializer):
    """Read serializer — returns nested user info."""

    student              = UserBriefSerializer(read_only=True)
    workplace_supervisor = UserBriefSerializer(read_only=True)
    academic_supervisor  = UserBriefSerializer(read_only=True)
    created_by           = UserBriefSerializer(read_only=True)
    company_detail = CompanySerializer(source='company', read_only=True)
    duration_days        = serializers.SerializerMethodField()

    class Meta:
        model  = Placement
        fields = [
            'id', 'student', 'workplace_supervisor', 'academic_supervisor',
            'company', 'company_detail'
            'company_name', 'company_address', 'job_title', 'description',
            'start_date', 'end_date', 'weekly_log_deadline',
            'status', 'invited_supervisor_email', 'duration_days', 'created_by', 'created_at', 'updated_at',
        ]

    def get_duration_days(self, obj):
        if obj.start_date and obj.end_date:
            return (obj.end_date - obj.start_date).days
        return None


class PlacementCreateSerializer(serializers.ModelSerializer):
    """Write serializer used by admin to create/update placements."""

    class Meta:
        model  = Placement
        fields = [
            'student', 'workplace_supervisor', 'academic_supervisor',
            'company', 'company_name', 'company_address', 'job_title', 'description',
            'start_date', 'end_date', 'weekly_log_deadline', 'status',
        ]

    def validate(self, data):
        student = data.get('student')
        wp_sup  = data.get('workplace_supervisor')
        ac_sup  = data.get('academic_supervisor')

        if student and student.role != 'student':
            raise serializers.ValidationError({'student': 'Selected user is not a student.'})
        if wp_sup and wp_sup.role != 'workplace_supervisor':
            raise serializers.ValidationError(
                {'workplace_supervisor': 'Selected user is not a workplace supervisor.'}
            )
        if ac_sup and ac_sup.role != 'academic_supervisor':
            raise serializers.ValidationError(
                {'academic_supervisor': 'Selected user is not an academic supervisor.'}
            )

        start = data.get('start_date')
        end   = data.get('end_date')
        if start and end and end <= start:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})

        return data

    def validate_student(self, value):
        # Prevent a student from having two active placements
        instance = self.instance
        qs = Placement.objects.filter(student=value).exclude(status='cancelled')
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                'This student already has an active placement.'
            )
        return value

class StudentPlacementSubmitSerializer(serializers.Serializer):
    """Student submits a placement request (company + job details)."""

    # Company — either pick existing or provide new details
    company            = serializers.PrimaryKeyRelatedField(
                             queryset=Company.objects.all(), required=False, allow_null=True
                         )
    new_company_name   = serializers.CharField(max_length=255, required=False)
    new_company_address = serializers.CharField(required=False, allow_blank=True)
    new_company_email  = serializers.EmailField(required=False, allow_blank=True)
    new_company_phone  = serializers.CharField(max_length=30, required=False, allow_blank=True)

    # Placement fields
    job_title          = serializers.CharField(max_length=255)
    description        = serializers.CharField(required=False, allow_blank=True)
    start_date         = serializers.DateField()
    end_date           = serializers.DateField()

    # Optional supervisor link
    workplace_supervisor = serializers.PrimaryKeyRelatedField(
                               queryset=CustomUser.objects.filter(role='workplace_supervisor'),
                               required=False, allow_null=True
                           )
    invited_supervisor_email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('company') and not data.get('new_company_name'):
            raise serializers.ValidationError(
                'Either select an existing company or provide a new company name.'
            )
        if data.get('start_date') and data.get('end_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        return data

    def create(self, validated_data):
        user = self.context['request'].user

        # Check student doesn't already have a non-cancelled placement
        if Placement.objects.filter(student=user).exclude(status='cancelled').exists():
            raise serializers.ValidationError(
                {'detail': 'You already have a placement.'}
            )

        # Resolve or create company
        company = validated_data.get('company')
        if not company and validated_data.get('new_company_name'):
            company = Company.objects.create(
                name=validated_data['new_company_name'],
                address=validated_data.get('new_company_address', ''),
                email=validated_data.get('new_company_email', ''),
                phone=validated_data.get('new_company_phone', ''),
                created_by=user,
            )

        placement = Placement.objects.create(
            student=user,
            company=company,
            company_name=company.name if company else validated_data.get('new_company_name', ''),
            company_address=company.address if company else validated_data.get('new_company_address', ''),
            job_title=validated_data['job_title'],
            description=validated_data.get('description', ''),
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            status='pending',
            workplace_supervisor=validated_data.get('workplace_supervisor'),
            invited_supervisor_email=validated_data.get('invited_supervisor_email', ''),
            created_by=user,
        )
        return placement

    
    