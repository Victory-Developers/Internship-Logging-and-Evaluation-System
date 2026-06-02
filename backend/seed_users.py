import os
import django

# Initialize the Django execution context environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'iles_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_system_users():
    # 1. Extract credentials from Render's environment scope
    admin_pass = os.environ.get("SUPER_PASS", "AdminPass123!")
    admin_email = os.environ.get("SUPER_EMAIL", "admin@example.com")

    student_pass = os.environ.get("STUDENT_PASS", "StudentPass123!")
    student_email = os.environ.get("STUDENT_EMAIL", "student@example.com")

    # 2. Provision the Administrator Account
    if not User.objects.filter(email=admin_email).exists():
        User.objects.create_superuser(email=admin_email, password=admin_pass, full_name="Admin Allan", role="admin")
        print(f"Successfully provisioned Superuser: {admin_email}")
    else:
        print(f"Superuser '{admin_email}' already exists. Skipping compilation.")

    # 3. Provision the Standard Student Account
    if not User.objects.filter(email=student_email).exists():
        # create_user automatically enforces is_superuser=False and is_staff=False
        User.objects.create_user(email=student_email, password=student_pass, full_name="Student Sam", role="student", status="active", student_number="ST-2026")
        print(f"Successfully provisioned Student User")
    else:
        print(f"Student User '{student_email}' already exists. Skipping compilation.")

if __name__ == '__main__':
    create_system_users()
