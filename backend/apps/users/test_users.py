import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import CustomUser


@pytest.mark.django_db
def test_user_registration():
    client = APIClient()

    # 1. Register a student user (requires confirm_password + student_number)
    register_url = reverse('register')
    payload = {
        'email': 'newstudent@example.com',
        'password': 'StrongPassword123!',
        'confirm_password': 'StrongPassword123!',
        'full_name': 'New Student',
        'role': 'student',
        'student_number': '2100700001'
    }
    response = client.post(register_url, payload, format='json')
    assert response.status_code == 201
    assert response.data['email'] == 'newstudent@example.com'
    assert response.data['role'] == 'student'

    # Newly registered users are 'pending' — cannot login yet
    login_url = reverse('login')
    login_payload = {'email': 'newstudent@example.com', 'password': 'StrongPassword123!'}
    response = client.post(login_url, login_payload, format='json')
    assert response.status_code == 400  # blocked: pending approval


@pytest.mark.django_db
def test_login_and_profile():
    client = APIClient()

    # Pre-create an active user (simulates admin-approved account)
    user = CustomUser.objects.create_user(
        email='active@example.com', password='StrongPassword123!',
        full_name='Active User', role='student', status='active',
        student_number='2100700002'
    )

    # 1. Login with correct credentials
    login_url = reverse('login')
    response = client.post(login_url, {'email': 'active@example.com', 'password': 'StrongPassword123!'}, format='json')
    assert response.status_code == 200
    assert 'access' in response.data
    access_token = response.data['access']

    # 2. Retrieve profile
    profile_url = reverse('profile')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = client.get(profile_url)
    assert response.status_code == 200
    assert response.data['full_name'] == 'Active User'

    # 3. Update profile
    response = client.patch(profile_url, {'full_name': 'Updated Name'}, format='json')
    assert response.status_code == 200
    assert response.data['full_name'] == 'Updated Name'

    # 4. Wrong password login attempt
    client.credentials()  # clear auth
    response = client.post(login_url, {'email': 'active@example.com', 'password': 'WrongPassword!'}, format='json')
    assert response.status_code == 400
