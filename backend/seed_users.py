import os
import django

# Initialize the Django execution context environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'iles_project.settings')  # Replace with your actual project settings module name
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_system_users():
    # 1. Extract credentials from Render's environment scope
    admin_user = os.environ.get("SUPER_USER", "admin")
    admin_pass = os.environ.get("SUPER_PASS", "AdminPass123!")
    admin_email = os.environ.get("SUPER_EMAIL", "admin@example.com")

    student_user = os.environ.get("STUDENT_USER", "student_01")
    student_pass = os.environ.get("STUDENT_PASS", "StudentPass123!")
    student_email = os.environ.get("STUDENT_EMAIL", "student@example.com")

    # 2. Provision the Administrator Account
    if not User.objects.filter(username=admin_user).exists():
        User.objects.create_superuser(username=admin_user, email=admin_email, password=admin_pass)
        print(f"Successfully provisioned Superuser: {admin_user}")
    else:
        print(f"Superuser '{admin_user}' already exists. Skipping compilation.")

    # 3. Provision the Standard Student Account
    if not User.objects.filter(username=student_user).exists():
        # create_user automatically enforces is_superuser=False and is_staff=False
        User.objects.create_user(username=student_user, email=student_email, password=student_pass)
        print(f"Successfully provisioned Student User: {student_user}")
    else:
        print(f"Student User '{student_user}' already exists. Skipping compilation.")

if __name__ == '__main__':
    create_system_users()
