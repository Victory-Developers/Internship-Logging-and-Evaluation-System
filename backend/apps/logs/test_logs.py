import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import CustomUser
from apps.placements.models import Placement, Company
from apps.logs.models import WeeklyLog, LogComment
from datetime import date
from django.utils import timezone

@pytest.fixture
def test_setup():
    # Setup users
    student = CustomUser.objects.create_user(
        email='student@example.com', password='password123', full_name='Student User', role='student', status='active'
    )
    workplace_sup = CustomUser.objects.create_user(
        email='workplace@example.com', password='password123', full_name='Workplace Supervisor', role='workplace_supervisor', status='active'
    )
    academic_sup = CustomUser.objects.create_user(
        email='academic@example.com', password='password123', full_name='Academic Supervisor', role='academic_supervisor', status='active'
    )
    admin_user = CustomUser.objects.create_user(
        email='admin@example.com', password='password123', full_name='Admin User', role='admin', status='active'
    )
    other_student = CustomUser.objects.create_user(
        email='otherstudent@example.com', password='password123', full_name='Other Student', role='student', status='active'
    )

    company = Company.objects.create(name='Acme Corp')

    # Placement
    placement = Placement.objects.create(
        student=student,
        workplace_supervisor=workplace_sup,
        academic_supervisor=academic_sup,
        company=company,
        company_name='Acme Corp',
        start_date=date(2026, 6, 1),
        end_date=date(2026, 8, 1),
        status='active'
    )

    return {
        'student': student,
        'workplace_sup': workplace_sup,
        'academic_sup': academic_sup,
        'admin': admin_user,
        'other_student': other_student,
        'placement': placement
    }


@pytest.mark.django_db
def test_student_log_lifecycle(test_setup):
    client = APIClient()
    student = test_setup['student']
    client.force_authenticate(user=student)

    # 1. Create a draft weekly log
    url = reverse('student-log-list-create')
    payload = {
        'week_number': 1,
        'week_start': '2026-06-01',
        'week_end': '2026-06-07',
        'activities': 'Draft activity description',
        'learning': 'Django basics',
        'challenges': 'None',
        'next_week': 'Continue coding'
    }
    response = client.post(url, payload, format='json')
    assert response.status_code == 201
    log_id = response.data['id']

    # 2. Get list of logs
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['activities'] == 'Draft activity description'

    # 3. View detail log
    detail_url = reverse('student-log-detail', kwargs={'pk': log_id})
    response = client.get(detail_url)
    assert response.status_code == 200
    assert response.data['learning'] == 'Django basics'

    # 4. Patch draft weekly log
    patch_payload = {
        'activities': 'Updated activities performed'
    }
    response = client.patch(detail_url, patch_payload, format='json')
    assert response.status_code == 200
    assert response.data['activities'] == 'Updated activities performed'

    # 5. Get Student Progress
    progress_url = reverse('student-log-progress')
    response = client.get(progress_url)
    assert response.status_code == 200
    assert response.data['draft'] == 1

    # 6. Submit the weekly log
    submit_url = reverse('student-log-submit', kwargs={'pk': log_id})
    response = client.post(submit_url)
    assert response.status_code == 200
    assert response.data['status'] == 'submitted'

    # Verify that a submitted log cannot be patched
    response = client.patch(detail_url, patch_payload, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_supervisor_log_reviews_and_comments(test_setup):
    client = APIClient()
    student = test_setup['student']
    workplace_sup = test_setup['workplace_sup']
    academic_sup = test_setup['academic_sup']
    placement = test_setup['placement']

    # Create a pre-submitted log
    log = WeeklyLog.objects.create(
        placement=placement,
        student=student,
        week_number=1,
        week_start=date(2026, 6, 1),
        week_end=date(2026, 6, 7),
        activities='Submitted logs',
        learning='Testing',
        challenges='None',
        status='submitted'
    )

    # 1. Workplace supervisor list assigned logs
    client.force_authenticate(user=workplace_sup)
    list_url = reverse('workplace-log-list')
    response = client.get(list_url)
    assert response.status_code == 200
    assert len(response.data) == 1

    # 2. Workplace supervisor review log (Approve/Reject)
    review_url = reverse('workplace-log-review', kwargs={'pk': log.pk})
    review_payload = {
        'action': 'approve',
        'comment': 'Well done!'
    }
    response = client.post(review_url, review_payload, format='json')
    assert response.status_code == 200
    assert response.data['status'] == 'approved'

    # Verify log comment created
    assert LogComment.objects.filter(log=log, author=workplace_sup).exists()

    # 3. Academic supervisor stand-alone comment creation
    client.force_authenticate(user=academic_sup)
    comment_url = reverse('log-comment-create', kwargs={'pk': log.pk})
    comment_payload = {
        'comment': 'Looks good from academic side.'
    }
    response = client.post(comment_url, comment_payload, format='json')
    assert response.status_code == 201
    assert response.data['log_status'] == 'reviewed'  # Status moves to reviewed after standalone comment


@pytest.mark.django_db
def test_admin_and_academic_views(test_setup):
    client = APIClient()
    admin_user = test_setup['admin']
    academic_sup = test_setup['academic_sup']
    student = test_setup['student']
    placement = test_setup['placement']

    # Create log
    log = WeeklyLog.objects.create(
        placement=placement,
        student=student,
        week_number=1,
        week_start=date(2026, 6, 1),
        week_end=date(2026, 6, 7),
        activities='Admin checks',
        learning='None',
        challenges='None',
        status='submitted'
    )

    # 1. Academic Log list
    client.force_authenticate(user=academic_sup)
    academic_list_url = reverse('academic-log-list')
    response = client.get(academic_list_url)
    assert response.status_code == 200
    assert len(response.data) == 1

    # 2. Admin Log list
    client.force_authenticate(user=admin_user)
    admin_list_url = reverse('admin-log-list')
    response = client.get(admin_list_url)
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_log_detail_view_permissions(test_setup):
    client = APIClient()
    student = test_setup['student']
    workplace_sup = test_setup['workplace_sup']
    academic_sup = test_setup['academic_sup']
    other_student = test_setup['other_student']
    placement = test_setup['placement']

    log = WeeklyLog.objects.create(
        placement=placement,
        student=student,
        week_number=1,
        week_start=date(2026, 6, 1),
        week_end=date(2026, 6, 7),
        activities='Confidential activities',
        learning='Sensors',
        challenges='None',
        status='submitted'
    )

    url = reverse('log-detail', kwargs={'pk': log.pk})

    # Authorized student
    client.force_authenticate(user=student)
    response = client.get(url)
    assert response.status_code == 200

    # Authorized workplace supervisor
    client.force_authenticate(user=workplace_sup)
    response = client.get(url)
    assert response.status_code == 200

    # Authorized academic supervisor
    client.force_authenticate(user=academic_sup)
    response = client.get(url)
    assert response.status_code == 200

    # Unauthorized student receives 403
    client.force_authenticate(user=other_student)
    response = client.get(url)
    assert response.status_code == 403
