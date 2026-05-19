# CSC 1202 — ILES Exam Study Sheet (2026)

**Goal:** memorise enough syntax to write Django + React code with a pen, no IDE, no autocomplete. The exam reuses AITS patterns — only the case study is new (ILES instead of AITS). Every block below is something that has appeared in or is one tiny step from a 2025 exam question.

---

## 0. Pen-and-paper survival rules

1. **Write line numbers in the margin** if the question says "fill line 3, 7, 12" — don't get them out of order.
2. **For fill-in questions, write the WHOLE line, not just the missing token.** Markers grade what's on the page.
3. **Indent Python with 4 spaces consistently.** Mixed tabs/spaces = wrong on paper too — they can see it.
4. **Close every bracket, brace, parenthesis, JSX tag.** Run a finger over each opener and find its closer before moving on.
5. **In React, `useState` initialises state, `useEffect` runs side effects.** AITS swapped them as a trap in two separate questions — don't fall for it.
6. **Always import what you use.** Even on paper. `from rest_framework.views import APIView`, `from django.db import models`, `from django.contrib.auth.models import AbstractUser`.
7. **Add a one-line comment when asked** (Q5 last year demanded it). Format: `# This filters issues by the logged-in user`.
8. **Status codes:** 200 OK, 201 Created, 204 No Content, 400 Bad, 401 Unauth, 403 Forbidden, 404 Not Found.
9. **HTTP verbs:** GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove).
10. **Five questions, three hours = ~35 min each.** Don't camp on one. Move on if stuck.

---

## 1. ILES domain you must know cold

Four roles: **Student Intern**, **Workplace Supervisor**, **Academic Supervisor**, **Internship Administrator**.

Core entities (use these names in answers unless the question gives different ones):

- `CustomUser` (extends `AbstractUser`) — `role`, `department`, `staff_number` (optional), `student_number` (optional)
- `Department`
- `InternshipPlacement` — student, company_name, supervisor, start_date, end_date
- `WeeklyLog` — placement, week_number, activities, hours, status
- `EvaluationCriteria` — name, weight (e.g. 0.4 for 40%)
- `Evaluation` — student, criteria, score, evaluator

Workflow states for `WeeklyLog` (from Dr. Wakholi's slide 2): **Draft -> Submitted -> Reviewed -> Approved**, with **Rejected** as a fifth state. Valid transitions per slide 1:

- Draft -> Submitted
- Submitted -> Reviewed
- Reviewed -> Approved
- **Reviewed -> Draft** (revision arrow — this is the one most students get wrong)

Weighted scoring (Dr's example on slide 1): **Technical 40% + Communication 30% + Professionalism 30%**, so `Final Score = T*0.4 + C*0.3 + P*0.3`. The exam may use different field names (workplace/academic/logbook) — same arithmetic.

---

## 2. Django models — the syntax block you must own

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('workplace_supervisor', 'Workplace Supervisor'),
        ('academic_supervisor', 'Academic Supervisor'),
        ('admin', 'Administrator'),
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class InternshipPlacement(models.Model):
    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='placements'
    )
    company = models.CharField(max_length=150)
    supervisor = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True,
        related_name='supervised_placements'
    )
    start_date = models.DateField()
    end_date = models.DateField()


class WeeklyLog(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
        ('Reviewed', 'Reviewed'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    placement = models.ForeignKey(
        InternshipPlacement, on_delete=models.CASCADE, related_name='logs'
    )
    week_number = models.PositiveIntegerField()
    activities = models.TextField()
    hours = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('placement', 'week_number')
        ordering = ['-week_number']

    def __str__(self):
        return f"Week {self.week_number} — {self.placement.student.username}"
```

### Field types — memorise these names

| Field | Use |
|---|---|
| `CharField(max_length=N)` | Short text. Always need max_length. |
| `TextField()` | Long text. No max_length. |
| `IntegerField()` / `PositiveIntegerField()` | Integers. |
| `FloatField()` | Float. |
| `DecimalField(max_digits=5, decimal_places=2)` | Money / scores. |
| `BooleanField(default=False)` | Yes/no. |
| `DateField()` / `DateTimeField()` | Dates. `auto_now_add=True` on create, `auto_now=True` on every save. |
| `EmailField()` | Validated email. |
| `URLField()` | Validated URL. |
| `FileField(upload_to='path/')` | File upload. |
| `ImageField()` | Image upload. |

### Relationships — the ones that appear on exams

```python
# ONE-to-MANY  — many logs belong to one placement
placement = models.ForeignKey(Placement, on_delete=models.CASCADE,
                              related_name='logs')

# ONE-to-ONE  — one profile per user
user = models.OneToOneField(User, on_delete=models.CASCADE)

# MANY-to-MANY — a student can have many criteria
criteria = models.ManyToManyField(EvaluationCriteria, related_name='students')
```

### `on_delete` options (pick the right one)

- `CASCADE` — delete the child when the parent is deleted (most common).
- `SET_NULL` — set FK to NULL (needs `null=True`). Use when child should survive.
- `PROTECT` — block deletion of parent.
- `SET_DEFAULT` — use `default=` value.
- `DO_NOTHING` — don't touch (rare).

### `related_name`

Lets you reverse-traverse. `student.placements.all()` works because `related_name='placements'` was set on the FK from Placement to student.

### `__str__`

Always implement it. Returns a string. Markers love it. One line. `return self.name` or `return f"..."`.

---

## 3. Django ORM — query patterns

```python
Model.objects.all()
Model.objects.filter(status='Approved')
Model.objects.exclude(status='Resolved')
Model.objects.get(pk=1)            # raises if 0 or >1
Model.objects.first()
Model.objects.count()
Model.objects.order_by('-created_at')

# Field lookups — append __<lookup>
WeeklyLog.objects.filter(week_number__gte=5)
WeeklyLog.objects.filter(activities__icontains='design')
WeeklyLog.objects.filter(status__in=['Submitted', 'Reviewed'])

# Traverse relationships with __
WeeklyLog.objects.filter(placement__student__department=request.user.department)

# Combine excludes / filters
WeeklyLog.objects.filter(
    placement__student__department=request.user.department
).exclude(status='Approved')

# OR with Q
from django.db.models import Q
WeeklyLog.objects.filter(Q(status='Submitted') | Q(status='Reviewed'))

# Aggregate
from django.db.models import Count, Avg, Sum
WeeklyLog.objects.aggregate(total=Count('id'), avg_hours=Avg('hours'))
# Annotate per row
Placement.objects.annotate(num_logs=Count('logs'))
```

### The Q1c-style query

> "All unresolved logs submitted by students in the same department as the registrar."

```python
WeeklyLog.objects.filter(
    placement__student__department=request.user.department
).exclude(status='Approved')
```

---

## 4. DRF — serializers

```python
from rest_framework import serializers
from .models import WeeklyLog

class WeeklyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyLog
        fields = ['id', 'placement', 'week_number', 'activities',
                  'hours', 'status']
        # OR
        # fields = '__all__'
        read_only_fields = ['status']

    # Single-field validation
    def validate_week_number(self, value):
        if value < 1 or value > 52:
            raise serializers.ValidationError("Week must be 1–52.")
        return value

    # Cross-field validation
    def validate(self, data):
        if not data.get('activities'):
            raise serializers.ValidationError(
                "Activities cannot be empty."
            )
        if data.get('hours', 0) > 80:
            raise serializers.ValidationError(
                "Hours per week cannot exceed 80."
            )
        return data
```

**Key rules:**

- `class Meta` must declare `model` and `fields`.
- `fields` is a list (or `'__all__'`). It is NOT a tuple in 2026 syntax — list is safer.
- Single-field validator is `validate_<fieldname>(self, value)` — return `value`.
- Cross-field validator is `validate(self, data)` — return `data`.
- Raise `serializers.ValidationError("message")` — not Python's `ValueError`.

---

## 5. DRF — views

### APIView (the one AITS asked you to write)

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import WeeklyLog
from .serializers import WeeklyLogSerializer

class StudentLogsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = WeeklyLog.objects.filter(
            placement__student=request.user
        )
        serializer = WeeklyLogSerializer(logs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WeeklyLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                placement=request.user.placements.first()
            )
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)
```

**Memorise the four lines that appear in nearly every view:**

```python
serializer = MySerializer(data=request.data)
if serializer.is_valid():
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### Generic views (shorter alternative)

```python
from rest_framework import generics

class LogListCreate(generics.ListCreateAPIView):
    serializer_class = WeeklyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeeklyLog.objects.filter(
            placement__student=self.request.user
        )
```

### URL wiring

```python
# project/urls.py
from django.urls import path, include
urlpatterns = [
    path('api/', include('logs.urls')),
]

# logs/urls.py
from django.urls import path
from .views import StudentLogsView

urlpatterns = [
    path('student-logs/', StudentLogsView.as_view(), name='student-logs'),
]
```

---

## 6. Authentication & RBAC

```python
from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role == 'student'

class IsOwnerOrSupervisor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.placement.student == request.user or \
               obj.placement.supervisor == request.user

# Use it:
class MyView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
```

In settings:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
AUTH_USER_MODEL = 'accounts.CustomUser'
```

---

## 7. Django signals — `post_save` pattern AITS asked

```python
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import WeeklyLog

@receiver(post_save, sender=WeeklyLog)
def notify_on_approval(sender, instance, created, **kwargs):
    # `created` is True on first save, False on update.
    # We only want UPDATES that flip status to 'Approved'.
    if not created and instance.status == 'Approved':
        send_mail(
            subject="Log Approved",
            message=f"Your week {instance.week_number} log was approved.",
            from_email="admin@iles.com",
            recipient_list=[instance.placement.student.email],
        )
```

**Bugs to watch for** (these appeared in AITS Q4):

- Missing `created` parameter → `created` undefined.
- Forgetting `if not created:` → email fires on first save too.
- Comparing status without ensuring it's a string (`==` not `=`).
- `recipient_list` must be a **list**, not a string.
- Decorator typo: `@receiver(post_save, sender=WeeklyLog)` — `sender=` is mandatory.

To detect status *change* (only fire when it transitions to Approved), use `pre_save` to capture old value:

```python
@receiver(pre_save, sender=WeeklyLog)
def stash_old_status(sender, instance, **kwargs):
    if instance.pk:
        instance._old_status = WeeklyLog.objects.get(pk=instance.pk).status
    else:
        instance._old_status = None

@receiver(post_save, sender=WeeklyLog)
def notify_on_status_change(sender, instance, created, **kwargs):
    if not created and instance._old_status != 'Approved' \
       and instance.status == 'Approved':
        send_mail(...)
```

Wire signals in `apps.py`:

```python
class LogsConfig(AppConfig):
    name = 'logs'
    def ready(self):
        from . import signals  # noqa
```

---

## 8. Django tests — exact pattern they grade

```python
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

User = get_user_model()

class WeeklyLogAPITest(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username='alice', password='pass123', role='student'
        )
        self.client = APIClient()
        self.client.login(username='alice', password='pass123')

    def test_student_can_create_log(self):
        data = {
            'week_number': 1,
            'activities': 'Read codebase',
            'hours': 20,
        }
        response = self.client.post('/api/logs/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_user_blocked(self):
        self.client.logout()
        response = self.client.get('/api/logs/')
        self.assertEqual(response.status_code, 401)

    def test_supervisor_cannot_create_log(self):
        supervisor = User.objects.create_user(
            username='bob', password='pass123', role='workplace_supervisor'
        )
        self.client.force_login(supervisor)
        response = self.client.post('/api/logs/', {}, format='json')
        self.assertIn(response.status_code, [403, 400])
```

**Bugs AITS asked you to fix in tests:**

- Used `User.objects.create()` instead of `create_user()` → password not hashed, `login()` fails.
- Forgot `self.client.login(...)` before the action being tested.
- Wrong expected status code (`200` instead of `403`).
- Test method name doesn't start with `test_` → not discovered.

---

## 9. Django settings + Heroku deployment

```python
# settings.py — PRODUCTION
import os
import dj_database_url

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
    )
}

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ...
]
```

### Procfile (no extension, in project root)

```
web: gunicorn projectname.wsgi --log-file -
release: python manage.py migrate --noinput
```

### runtime.txt

```
python-3.11.6
```

### .env (LOCAL ONLY — never committed)

```
SECRET_KEY=averylongrandomstring
DEBUG=False
ALLOWED_HOSTS=yourapp.herokuapp.com,localhost
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

### Bugs AITS asked you to fix in settings

- `DEBUG = True` in production → leaks stack traces. Fix: `DEBUG = False`.
- `ALLOWED_HOSTS = []` → all requests rejected when DEBUG is False. Fix: `['yourapp.herokuapp.com']`.
- `SECRET_KEY = 'hard-coded-string'` → leak risk. Fix: `os.environ.get('SECRET_KEY')`.
- `STATIC_ROOT = ''` → `collectstatic` fails. Fix: `os.path.join(BASE_DIR, 'staticfiles')`.
- Procfile pointing at the wrong wsgi module, missing `gunicorn`, or missing `--log-file -`.
- `.env` shipped with `DEBUG=True` and `ALLOWED_HOSTS=*` — both insecure for prod.

---

## 10. React — the absolute essentials

### Functional component

```jsx
function StudentDashboard() {
  return (
    <div>
      <h1>My Logs</h1>
    </div>
  );
}
export default StudentDashboard;
```

### `useState` (initialises and updates state)

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);     // 0 is the initial value
  const [logs, setLogs]   = useState([]);    // empty array for lists
  const [user, setUser]   = useState(null);  // null for "no value yet"
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### `useEffect` (run a side effect)

```jsx
import { useEffect, useState } from 'react';

function LogList() {
  const [logs, setLogs] = useState([]);   // <-- useState, NOT useEffect

  useEffect(() => {
    fetch('/api/student-logs/')
      .then(res => res.json())
      .then(data => setLogs(data));
  }, []);  // empty array = run once on mount

  return (
    <ul>
      {logs.map(log => (
        <li key={log.id}>{log.week_number} — {log.status}</li>
      ))}
    </ul>
  );
}
```

**The classic AITS trap (appeared twice):**

```jsx
const [issues, setIssues] = useEffect([]);   // WRONG
const [issues, setIssues] = useState([]);    // CORRECT
```

### POST with `fetch`

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/logs/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (res.ok) {
    setSuccess(true);
  } else {
    const errBody = await res.json();
    setError(errBody.detail || 'Submission failed');
  }
};
```

### Controlled form

```jsx
function LogForm() {
  const [formData, setFormData] = useState({
    week_number: '', activities: '', hours: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/logs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to submit.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="week_number" value={formData.week_number}
             onChange={handleChange} />
      <textarea name="activities" value={formData.activities}
                onChange={handleChange} />
      <input name="hours" value={formData.hours}
             onChange={handleChange} />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
      {success && <p>Log submitted successfully!</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Conditional rendering

```jsx
{ success && <p>Done!</p> }                  // render if truthy
{ error ? <p>{error}</p> : <p>OK</p> }       // ternary
{ items.length === 0 && <p>No items</p> }
```

### List rendering — never forget `key`

```jsx
{logs.map(log => <li key={log.id}>{log.week_number}</li>)}
```

### Toast on PATCH response (AITS Q4b style)

```jsx
const updateLog = async (id) => {
  const res = await fetch(`/api/logs/${id}/`, { method: 'PATCH' });
  const data = await res.json();                // need to read body
  if (data.status === 'Approved') {             // === not =, .status not res.status
    Toast('Approved!');
  }
};
```

**Bugs to watch for:**

- `data.status = 'Approved'` (assignment) instead of `===` (comparison).
- `res.status` (HTTP code) instead of `data.status` (model field).
- Missing `await res.json()` → comparing a Promise to a string.

---

## 11. Weighted scoring (ILES-specific)

```python
from decimal import Decimal

class Evaluation(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    workplace_score = models.DecimalField(max_digits=5, decimal_places=2)
    academic_score  = models.DecimalField(max_digits=5, decimal_places=2)
    logbook_score   = models.DecimalField(max_digits=5, decimal_places=2)
    total           = models.DecimalField(max_digits=5, decimal_places=2,
                                          blank=True, null=True)

    class Meta:
        unique_together = ('student',)   # one evaluation per student

    def save(self, *args, **kwargs):
        self.total = (
            self.workplace_score * Decimal('0.4') +
            self.academic_score  * Decimal('0.3') +
            self.logbook_score   * Decimal('0.3')
        )
        super().save(*args, **kwargs)
```

**Decimals matter** — multiplying a `DecimalField` by a Python `float` raises `TypeError`. Use `Decimal('0.4')`.

**Preventing duplicate evaluation:**

- `unique_together = ('student',)` at the DB level, OR
- In a serializer's `validate`:
  ```python
  if Evaluation.objects.filter(student=data['student']).exists():
      raise serializers.ValidationError("Already evaluated.")
  ```

---

## 12. Workflow state transitions

```python
ALLOWED_TRANSITIONS = {
    'Draft':     ['Submitted'],
    'Submitted': ['Reviewed', 'Rejected'],
    'Reviewed':  ['Approved', 'Draft'],     # Reviewed -> Draft is the revision arrow
    'Approved':  [],
    'Rejected':  ['Draft'],                 # rejected -> back to draft for fix-up
}

class WeeklyLog(models.Model):
    # ... fields ...

    def save(self, *args, **kwargs):
        if self.pk:
            old = WeeklyLog.objects.get(pk=self.pk)
            if old.status != self.status:
                if self.status not in ALLOWED_TRANSITIONS[old.status]:
                    raise ValueError(
                        f"Cannot move from {old.status} to {self.status}"
                    )
        super().save(*args, **kwargs)
```

---

## 13. Top 30 paper-exam syntax fragments to overlearn

1. `class Foo(models.Model):`
2. `name = models.CharField(max_length=100)`
3. `student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='logs')`
4. `def __str__(self): return self.name`
5. `class Meta: model = Foo; fields = '__all__'`
6. `def validate(self, data): ... return data`
7. `raise serializers.ValidationError("msg")`
8. `serializer = FooSerializer(data=request.data)`
9. `if serializer.is_valid(): serializer.save()`
10. `return Response(serializer.data, status=status.HTTP_201_CREATED)`
11. `Foo.objects.filter(...).exclude(...)`
12. `permission_classes = [IsAuthenticated]`
13. `@receiver(post_save, sender=Foo)`
14. `def handler(sender, instance, created, **kwargs):`
15. `if not created and instance.status == 'Approved':`
16. `send_mail(subject, body, from_email, [to_email])`
17. `self.client.login(username='x', password='y')`
18. `self.assertEqual(response.status_code, 201)`
19. `User.objects.create_user(username='x', password='y')`
20. `path('api/foo/', FooView.as_view())`
21. `const [foo, setFoo] = useState(initialValue)`
22. `useEffect(() => { ... }, [])`
23. `fetch('/api/x/').then(r => r.json()).then(setFoo)`
24. `fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})`
25. `e.preventDefault()`
26. `setFormData({...formData, [e.target.name]: e.target.value})`
27. `{items.map(i => <li key={i.id}>{i.name}</li>)}`
28. `{flag && <Component />}`
29. `<input value={formData.x} onChange={handleChange} name="x" />`
30. `import os; SECRET_KEY = os.environ.get('SECRET_KEY')`

If you can write these 30 lines from memory, you will pass the practical.

---

## 14. Concept paragraphs you may be asked (4 marks each)

Each "concept" question in AITS was 4 marks. Aim for ~4 short sentences, one mark each. Drafts you can adapt:

### REST APIs
A REST API is an HTTP interface exposing resources (e.g. `/api/logs/`) and operating on them using standard verbs (GET, POST, PUT, PATCH, DELETE). It returns structured data — almost always JSON — so the React frontend can fetch and render data without sharing code or a database with the backend. This separation lets frontend and backend evolve independently. In ILES, the React UI fetches the student's weekly logs from a Django REST endpoint instead of querying the database directly.

### Input validation
Input validation rejects bad data before it touches the database, protecting against bugs (wrong types, missing required fields) and security issues (SQL injection, oversized payloads). DRF serializers centralise this — `validate_<field>` for single fields and `validate` for cross-field rules — and return clear 400-level errors. The frontend then surfaces those errors to the user so they can correct them, instead of failing silently. In ILES this means a weekly log cannot be saved without a week number, activities, and a positive hours value.

### useState + onChange in React forms
`useState` gives a component a piece of memory: a current value plus a setter function. Binding the input's `value` to that state and its `onChange` to the setter makes it a *controlled* input — React owns the value and re-renders the input on every keystroke. This is essential because it lets you validate as the user types, disable Submit until the form is valid, and reset the form after submission.

### Automated backend testing
Automated tests run your code against a known input and check the output, catching regressions before they reach users. They fail even when code "looks correct" because the test exposes a hidden assumption — e.g. an unauthenticated request silently allowed through, or a duplicate evaluation being saved. In ILES, tests should cover the four state transitions, RBAC (students can't approve logs), and the scoring formula.

### REST and the Django/React split
The Django backend handles authentication, business rules (state transitions, weighted scoring) and persistence, and exposes its data as JSON over REST. React owns the UI: it fetches that JSON, renders forms and dashboards, and sends user actions back as POST/PATCH/DELETE requests. Neither side imports the other; they communicate only over HTTP. This is what allows the same backend to power a web app, a mobile app, or a CLI later.

### useEffect for data fetching
`useEffect(fn, deps)` runs `fn` after render. Passing `[]` as `deps` makes it run exactly once on mount — the standard pattern for "load data when the page opens." Without a dependency array, the effect re-runs on every render and you get an infinite fetch loop. Updating state inside the effect triggers a re-render, which is fine because the empty deps array stops the effect from running again.

---

## 15. The 60-minute pre-exam drill

Spend an hour today doing this with a pen and a blank sheet:

1. Write the full `WeeklyLog` model from memory, including imports.
2. Write a `WeeklyLogSerializer` with one single-field validator and one cross-field validator.
3. Write a DRF `APIView` with `get` and `post`. No peeking.
4. Write a `post_save` signal that emails on status change to Approved.
5. Write a test class with `setUp`, login, POST, and `assertEqual(...,201)`.
6. Write a complete React `LogForm` with controlled inputs, submit, success, error, loading.
7. Write a complete React `LogList` with `useState([])`, `useEffect(...,[])`, fetch, map with `key`.
8. Write `settings.py` snippet with `DEBUG`, `ALLOWED_HOSTS`, `DATABASES`, `STATIC_ROOT` for production.
9. Write a Procfile and a `.env` for Heroku.
10. Write a 4-mark concept paragraph on REST APIs and another on input validation.

If any of those 10 things take longer than 6 minutes to write, **redo only that one** until it does.

---

## 16. Authentication & Authorisation cheat sheet (Lecture 4)

This is the lecture with the most slides (28). Expect at least one 4-mark concept Q and one short code Q.

### Concept vocabulary

- **Authentication** = "Who are you?" — verifying identity (username/password, biometric, OTP).
- **Authorisation** = "What can you do?" — deciding what an authenticated user is allowed to access.
- Both are required. Authentication without authorisation = everyone can do anything. Authorisation without authentication = impossible (you don't know who to authorise).

### Types of authentication (memorise these names)

| Type | Meaning |
|---|---|
| **SFA** | Single-factor — one credential (just password). |
| **2FA** | Two-factor — password + something else (SMS code, authenticator app). |
| **MFA** | Multi-factor — password + token + biometric, etc. |
| **Passwordless** | Magic link, OTP, biometric only. |

### Common authentication methods

- Username + password
- Biometric (Fingerprint, Face ID)
- One-Time Passwords (OTP)
- Social Authentication (Google, Facebook login)

### Authorisation mechanisms (4-mark Q bait)

| Acronym | Stands for | Meaning |
|---|---|---|
| **RBAC** | Role-Based Access Control | Permissions assigned to roles (Admin, Student); users inherit role permissions. **This is what ILES uses.** |
| **ABAC** | Attribute-Based Access Control | Permissions depend on attributes (location, device, time of day). |
| **DAC** | Discretionary Access Control | The resource owner decides who can access it. |
| **MAC** | Mandatory Access Control | Strict, centrally enforced policy (military / government). |

One-line "best fit" answer if asked: *ILES uses **RBAC** because permissions are stable per role (only supervisors review logs, only admins assign placements) and roles don't depend on context like time or location.*

### Django authentication (vanilla, non-DRF)

```python
# urls.py
from django.contrib.auth.views import LoginView, LogoutView
urlpatterns = [
    path('login/',  LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

# views.py
from django.contrib.auth.decorators import login_required, permission_required

@login_required
def my_view(request):
    return ...

@permission_required('logs.can_approve_weeklylog', raise_exception=True)
def approve_view(request, pk):
    ...
```

### Django Groups & Permissions

```python
from django.contrib.auth.models import Group, Permission

# Create groups (run in a migration or setUp)
student_group, _    = Group.objects.get_or_create(name='Student')
supervisor_group, _ = Group.objects.get_or_create(name='WorkplaceSupervisor')

# Attach a permission to a group
perm = Permission.objects.get(codename='change_weeklylog')
supervisor_group.permissions.add(perm)

# Assign a user to a group
user.groups.add(student_group)

# Check at runtime
user.has_perm('logs.change_weeklylog')
user.groups.filter(name='WorkplaceSupervisor').exists()
```

Define custom permissions in `Meta`:

```python
class WeeklyLog(models.Model):
    # ... fields ...
    class Meta:
        permissions = [
            ('can_approve_log',  'Can approve a weekly log'),
            ('can_review_log',   'Can review a weekly log'),
        ]
```

### DRF custom permission class

```python
from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.groups.filter(name='Student').exists()
```

### React Router protected route (role-based dashboard)

```jsx
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem('role');           // saved at login
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole)
    return <Navigate to="/" replace />;
  return children;
}

// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student"><StudentDashboard/></ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard/></ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
```

After login, store the role: `localStorage.setItem('role', data.role)`.

### Best practices (cite verbatim if asked)

- Strong password policies (length, complexity).
- Implement **MFA** for sensitive roles.
- Use secure hashing (**bcrypt** or **Argon2**) — Django uses PBKDF2 by default, which is acceptable.
- Session timeouts + account lockout after N failed attempts.
- **Principle of Least Privilege (PoLP)**: assign only the permissions a role truly needs.
- Regularly audit & review permissions.

---

## 17. Notifications cheat sheet — SMTP + Twilio + Toastify (Lecture 7)

### SMTP email configuration in `settings.py`

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')   # app password, not real password
DEFAULT_FROM_EMAIL = 'ILES <noreply@iles.mak.ac.ug>'
```

### Sending email (already in §7 but reproduced for completeness)

```python
from django.core.mail import send_mail

send_mail(
    subject="Log Approved",
    message="Your weekly log has been approved.",
    from_email="noreply@iles.mak.ac.ug",
    recipient_list=[user.email],     # MUST be a list
    fail_silently=False,
)
```

### Twilio SMS

`pip install twilio` then in `settings.py`:

```python
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN  = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')   # the FROM number Twilio gives you
```

Helper function:

```python
from twilio.rest import Client
from django.conf import settings

def send_sms(to_number: str, body: str):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=body,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to_number,
    )
    return message.sid
```

Trigger from a signal:

```python
@receiver(post_save, sender=WeeklyLog)
def sms_on_approval(sender, instance, created, **kwargs):
    if not created and instance.status == 'Approved':
        send_sms(
            instance.placement.student.phone_number,
            f"Week {instance.week_number} log approved."
        )
```

**Common bugs:**

- `from_` keyword has a trailing underscore (`from` is a Python keyword).
- `to=` must be a single E.164-formatted string (e.g. `+256700123456`), not a list.
- Forgetting to read SID/token from env → credentials leak in repo.

### React Toastify

`npm install react-toastify`

```jsx
// App.jsx — render the container once at the app root
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>{/* ... */}</Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

// Anywhere in a component:
toast.success("Log submitted!");
toast.error("Failed to submit.");
toast.info("Pending review.");
```

Trigger after an API response:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/logs/', { /* ... */ });
  if (res.ok) toast.success("Log submitted!");
  else        toast.error("Submission failed.");
};
```

---

## 18. SDLC + Requirements engineering (Lectures 1–2)

### SDLC phases — applied to ILES (memorise the mapping)

| Phase | What you do in ILES |
|---|---|
| **Planning** | Identify the four roles, scope (only Makerere internships), decide tech stack (Django + React + Postgres). |
| **Analysis** | Gather requirements: user stories, workflow states (Draft→Submitted→Reviewed→Approved/Rejected), entities. |
| **Design** | Draw the ERD (CustomUser–Placement–WeeklyLog–Evaluation), define API contract, sketch dashboards. |
| **Implementation** | Code Django models + serializers + APIViews; build React forms + dashboards. |
| **Testing** | Write unit tests (model save, state transitions, RBAC) + integration tests (API + auth). |
| **Deployment** | Deploy to Heroku: gunicorn, Postgres add-on, env vars, `collectstatic`. |

If asked for a 4-mark answer: list the six phases and give the one-line ILES example for each.

### Functional vs non-functional requirements

- **Functional** = what the system *does*. Verb-led. *"The system shall allow a student to submit a weekly log."*
- **Non-functional** = how the system *behaves*. Adjective-led, often measurable.

Slide-2 examples of non-functional for ILES:

| Category | Example |
|---|---|
| Security | Only assigned supervisors can review a student's logs. |
| Integrity | A student cannot have overlapping internship placements. |
| Performance | Dashboards load within 3 seconds. |
| Auditability | All review actions must be logged. |
| Scalability | System must support at least 500 concurrent users. |
| Reliability | No data loss on submission. |

### User stories — Dr's format

> **As a [role], I want to [action], so that [benefit].**

ILES examples, one per role, that you can write straight from memory:

1. *As a student, I want to submit weekly logs so that my supervisor can review my work.*
2. *As a workplace supervisor, I want to approve or reject weekly logs so that only valid work is recorded.*
3. *As an academic supervisor, I want to evaluate students using weighted criteria so that grading is standardised.*
4. *As an internship administrator, I want to assign supervisors to students so that every student is monitored.*

### Converting a user story → functional requirement

User story → identify the verb → state it as a "system shall" obligation.

- Story: *As a student, I want to submit a weekly log.*
- Requirement(s):
  - The system shall allow a student to create a weekly log.
  - The system shall allow editing while `status = Draft`.
  - The system shall prevent editing when `status = Approved`.
  - The system shall timestamp every submission.
  - The system shall reject submissions past the deadline.

This 1→many expansion is the easiest 6-mark answer in the paper.

### Entities — from user stories

The slide-3 trick: identify the **nouns** in your user stories. Those nouns become your entities.

> "As a student, I want to submit a weekly log so that my supervisor can review it."
> Nouns: **student, weekly log, supervisor.** → `CustomUser`, `WeeklyLog`, plus a supervisor relationship.

Then for each entity: list attributes, then list relationships (one-to-many, many-to-many).

### Five-step request flow (slide 3, easy 5-mark fill-in)

1. **React form submission** — user clicks Submit; React calls `e.preventDefault()` and `fetch(...)`.
2. **API request** — HTTP POST hits the Django URL with JSON body.
3. **Serializer validation** — DRF serializer validates fields; rejects with 400 if invalid.
4. **Database storage** — `serializer.save()` writes the row.
5. **JSON response** — Django returns `Response(data, status=201)`; React reads it and updates state.

Draw this as a simple boxes-and-arrows diagram if asked.
