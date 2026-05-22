import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import CustomUser
from apps.placements.models import Placement, Company
from apps.evaluations.models import WorkplaceEvaluation, AcademicEvaluation
from datetime import date

@pytest.fixture
def eval_setup():
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
        'placement': placement
    }


@pytest.mark.django_db
def test_workplace_evaluation_flow(eval_setup):
    client = APIClient()
    workplace_sup = eval_setup['workplace_sup']
    placement = eval_setup['placement']
    client.force_authenticate(user=workplace_sup)

    # 1. Create Workplace Evaluation
    url = reverse('workplace-eval-list-create')
    payload = {
        'placement': placement.id,
        'professionalism': '8.5',
        'technical_skills': '9.0',
        'communication': '7.5',
        'punctuality': '8.0',
        'overall_comment': 'Great job!'
    }
    response = client.post(url, payload, format='json')
    assert response.status_code == 201
    eval_id = response.data['id']

    # 2. Get list of workplace evaluations
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1

    # 3. Get Workplace Evaluation Detail
    detail_url = reverse('workplace-eval-detail', kwargs={'pk': eval_id})
    response = client.get(detail_url)
    assert response.status_code == 200
    assert response.data['overall_comment'] == 'Great job!'

    # 4. Patch Workplace Evaluation
    patch_payload = {
        'overall_comment': 'Updated Workplace Comment'
    }
    response = client.patch(detail_url, patch_payload, format='json')
    assert response.status_code == 200
    assert response.data['overall_comment'] == 'Updated Workplace Comment'


@pytest.mark.django_db
def test_academic_evaluation_flow(eval_setup):
    client = APIClient()
    academic_sup = eval_setup['academic_sup']
    placement = eval_setup['placement']
    client.force_authenticate(user=academic_sup)

    # 1. Create Academic Evaluation
    url = reverse('academic-eval-list-create')
    payload = {
        'placement': placement.id,
        'quality_of_work': '8.0',
        'internship_report': '9.0',
        'problem_solving': '8.5',
        'learning_outcomes': '9.0',
        'overall_comment': 'Outstanding academic report.'
    }
    response = client.post(url, payload, format='json')
    assert response.status_code == 201
    eval_id = response.data['id']

    # 2. Get list of academic evaluations
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1

    # 3. Get Academic Evaluation Detail
    detail_url = reverse('academic-eval-detail', kwargs={'pk': eval_id})
    response = client.get(detail_url)
    assert response.status_code == 200
    assert response.data['overall_comment'] == 'Outstanding academic report.'

    # 4. Patch Academic Evaluation
    patch_payload = {
        'overall_comment': 'Updated Academic Comment'
    }
    response = client.patch(detail_url, patch_payload, format='json')
    assert response.status_code == 200
    assert response.data['overall_comment'] == 'Updated Academic Comment'


@pytest.mark.django_db
def test_academic_supervisor_dashboard_and_scores(eval_setup):
    client = APIClient()
    academic_sup = eval_setup['academic_sup']
    placement = eval_setup['placement']

    # Create Academic Evaluation
    AcademicEvaluation.objects.create(
        placement=placement,
        supervisor=academic_sup,
        quality_of_work=8.0,
        internship_report=9.0,
        problem_solving=8.5,
        learning_outcomes=9.0,
        overall_comment='Outstanding academic report.'
    )

    client.force_authenticate(user=academic_sup)

    # Dashboard data
    dashboard_url = reverse('academic-supervisor-dashboard')
    response = client.get(dashboard_url)
    assert response.status_code == 200
    assert response.data['stats']['total_students'] == 1

    # Scores overview
    scores_url = reverse('academic-scores-overview')
    response = client.get(scores_url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['student_name'] == 'Student User'


@pytest.mark.django_db
def test_student_and_admin_scores_views(eval_setup):
    client = APIClient()
    student = eval_setup['student']
    workplace_sup = eval_setup['workplace_sup']
    academic_sup = eval_setup['academic_sup']
    admin_user = eval_setup['admin']
    placement = eval_setup['placement']

    # Create evaluations
    WorkplaceEvaluation.objects.create(
        placement=placement,
        supervisor=workplace_sup,
        professionalism=9.0,
        technical_skills=9.0,
        communication=8.0,
        punctuality=8.0,
        overall_comment='Nice'
    )
    AcademicEvaluation.objects.create(
        placement=placement,
        supervisor=academic_sup,
        quality_of_work=8.0,
        internship_report=9.0,
        problem_solving=8.5,
        learning_outcomes=9.0,
        overall_comment='Outstanding'
    )

    # 1. Student scores retrieval
    client.force_authenticate(user=student)
    url = reverse('student-scores')
    response = client.get(url)
    assert response.status_code == 200
    assert 'workplace_evaluation' in response.data
    assert response.data['workplace_evaluation']['professionalism'] == '9.0'
    assert response.data['academic_evaluation']['quality_of_work'] == '8.0'

    # 2. Admin scores overview retrieval
    client.force_authenticate(user=admin_user)
    url = reverse('admin-scores-overview')
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
