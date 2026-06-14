import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import CustomUser
from apps.placements.models import Company, Placement


@pytest.mark.django_db
def test_company_creation_and_listing():
    client = APIClient()
    student = CustomUser.objects.create_user(
        email='student@example.com', password='password123',
        full_name='Student User', role='student', status='active'
    )
    client.force_authenticate(user=student)

    # Create a company
    url = reverse('company-list-create')
    payload = {'name': 'Innovate Inc', 'address': '123 Tech Ave'}
    response = client.post(url, payload, format='json')
    assert response.status_code == 201
    assert response.data['name'] == 'Innovate Inc'

    # List companies
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_student_placement_submission():
    client = APIClient()

    student = CustomUser.objects.create_user(
        email='student@example.com', password='password123',
        full_name='Student User', role='student', status='active'
    )
    client.force_authenticate(user=student)

    # Submit placement with a new company (uses new_company_name, not company_name)
    submit_url = reverse('student-placement-submit')
    payload = {
        'new_company_name': 'Innovate Inc',
        'new_company_address': '123 Tech Ave',
        'job_title': 'Software Intern',
        'description': 'Building APIs',
        'start_date': '2026-06-01',
        'end_date': '2026-08-01',
    }
    response = client.post(submit_url, payload, format='json')
    assert response.status_code == 201
    assert response.data['status'] == 'pending'

    # Retrieve student's own placement
    my_url = reverse('my-placement')
    response = client.get(my_url)
    assert response.status_code == 200
    assert response.data['company_name'] == 'Innovate Inc'
