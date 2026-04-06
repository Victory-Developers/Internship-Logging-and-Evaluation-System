# Internship Logging and Evaluation System (ILES)
ILES is a project that supports internship coordination between student interns, workplace supervisors, academic supervisors, and internship administrators. It brings weekly logging, reviews, evaluations, and reporting into one role-based platform.

## Problem Statement

Many organizations offering internship programs lack a centralized, structured system to track and evaluate the progress of student interns. Supervisors struggle to consistently record activities and provide timely feedback, while academic institutions cannot easily monitor real‑world learning outcomes. Inefficient communication leads to misaligned expectations and reduces the educational value of internships.

The **Internship Logging & Evaluation System (ILES)** aims to solve these issues by providing a web‑based platform where student interns, workplace supervisors, and academic supervisors collaborate. The system will facilitate logging weekly activities, managing placements, conducting reviews, and computing weighted scores—all within a single, role‑aware application.

## Scope of the Project

The initial phase of ILES will focus on backend services, implementing core modules and APIs to support:

1. **User & Role Management** – registration, authentication, and permission handling for Student Interns, Workplace Supervisors, Academic Supervisors, and Internship Administrators.
2. **Internship Placement Module** – tracking placement details such as start/end dates, host organization, and assigned supervisor.
3. **Weekly Logbook Module** – enabling interns to submit weekly activity logs and attach supporting documents.
4. **Supervisor Review Workflow** – workflow for workplace and academic supervisors to review logbooks and provide comments.
5. **Academic Evaluation Module** – collection of final evaluations, grades, and remarks from academic supervisors.
6. **Weighted Score Computation** – algorithmic calculation of an overall score based on logbooks, reviews, and evaluations.
7. **Dashboards & Reporting** – endpoints exposing summary statistics, progress charts, and downloadable reports for administrators.

> Backend services are built with Django and exposed through REST APIs.

## Prerequisites

Python 3.12 or newer
Node.js 20 or newer
npm 10 or newer
PostgreSQL 14 or newer
Git

## Project Structure

backend

manage.py
apps/users: authentication, user accounts, and role-related logic
apps/placements: internship placement records
apps/logs: weekly logbook entries and related operations
apps/evaluations: academic evaluation and scoring data
apps/admin_panel: admin-facing API endpoints
iles_project: global Django settings, URL routing, and project config

frontend

src: React application source
public: static assets
Contributing
This is a coursework project, so keep contributions clear, small, and reviewable.

## Local Setup

1) Clone the repository
git clone https://github.com/Victory-Developers/Internship-Logging-and-Evaluation-System.git
cd Internship-Logging-and-Evaluation-System

2) Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

Create a .env file in the backend directory and define the project environment values.
cp .env.example .env

Run database migrations:

python manage.py migrate

Optional, for admin access:

python manage.py createsuperuser

Start the backend server:

python manage.py runserver

Default backend URL:
http://localhost:8000

3) Frontend setup
Open a new terminal:

cd frontend
npm install
npm run dev

Default frontend URL:
http://localhost:5173

## Useful Checks/Tests
Backend:

cd backend
source .venv/bin/activate
python manage.py test

Frontend:

cd frontend
npm run lint
npm run build

## Workflow

1. Pull the latest changes from main.
2. Create a branch from main.
3. Make your changes.
4. Test your code locally.
5. Push your branch and open a pull request.

## Branch naming

Use descriptive branch names:

feat/<short-description>
fix/<short-description>
docs/<short-description>

Examples:
- feat/logbook-review-comments
- fix/token-refresh-error
- docs/update-setup-steps

## Commit style

Use short, direct commit messages that explain intent.

Good examples:
- Add serializer validation for placement dates
- Fix frontend route guard for supervisor dashboard
- Update README file

## Pull Requests

When opening a PR:
- Use a clear title that explains what changed.
- Add a short description with context and impact.
- Mention any setup or migration steps reviewers should run.
- Keep PRs focused on one concern when possible.