import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Global mock for Vite's import.meta.env inside config.js
jest.mock('./src/api/config', () => {
  return {
    API_BASE_URL: 'http://localhost:8000/api',
    ROLES: {
      STUDENT: 'student',
      WORKPLACE_SUPERVISOR: 'workplace_supervisor',
      ACADEMIC_SUPERVISOR: 'academic_supervisor',
      ADMIN: 'admin',
    },
    LOG_STATUS: {
      DRAFT: 'draft',
      SUBMITTED: 'submitted',
      REVIEWED: 'reviewed',
      APPROVED: 'approved',
      REJECTED: 'rejected',
    },
    ENDPOINTS: {
      LOGIN: '/auth/login/',
      REGISTER: '/auth/register/',
      LOGOUT: '/auth/logout/',
      PROFILE: '/auth/profile/',
      TOKEN_REFRESH: '/auth/token/refresh/',
      FORGOT_PASSWORD: '/auth/forgot-password/',
      RESET_PASSWORD: '/auth/reset-password/',
      CHANGE_PASSWORD: '/auth/change-password/',
      PLACEMENTS: '/placements/',
      MY_PLACEMENT: '/placements/my/',
      MY_STUDENTS: '/placements/my-students/',
      MY_ACADEMIC_STUDENTS: '/placements/my-academic-students/',
      MY_LOGS: '/logs/my/',
      MY_LOG_PROGRESS: '/logs/my/progress/',
      SUPERVISOR_LOGS: '/logs/supervisor/',
      ACADEMIC_LOGS: '/logs/academic/',
      ADMIN_LOGS: '/logs/admin/',
      WORKPLACE_EVALUATIONS: '/evaluations/workplace/',
      ACADEMIC_EVALUATIONS: '/evaluations/academic/',
      ACADEMIC_SCORES: '/evaluations/academic/scores/',
      MY_SCORES: '/evaluations/my-scores/',
      ADMIN_SCORES: '/evaluations/admin/scores/',
      ADMIN_USERS: '/admin/users/',
      ADMIN_PENDING_USERS: '/admin/users/pending/',
      ADMIN_PENDING_USERS_COUNT: '/admin/users/pending/count/',
      ADMIN_USER_APPROVE: (id) => `/admin/users/${id}/approve/`,
      ADMIN_USER_REJECT: (id) => `/admin/users/${id}/reject/`,
      ADMIN_DASHBOARD: '/admin/dashboard/',
      ADMIN_REPORTS: '/admin/reports/',
      PLACEMENT_DETAIL: (id) => `/placements/${id}/`,
      MY_LOG_DETAIL: (id) => `/logs/my/${id}/`,
      LOG_DETAIL: (id) => `/logs/${id}/`,
      MY_LOG_SUBMIT: (id) => `/logs/my/${id}/submit/`,
      LOG_COMMENTS: (id) => `/logs/${id}/comments/`,
      SUPERVISOR_LOG_REVIEW: (id) => `/logs/supervisor/${id}/review/`,
      WORKPLACE_EVALUATION_DETAIL: (id) => `/evaluations/workplace/${id}/`,
      ACADEMIC_EVALUATION_DETAIL: (id) => `/evaluations/academic/${id}/`,
      ACADEMIC_DASHBOARD: '/evaluations/academic/dashboard/',
      COMPANIES: '/placements/companies/',
      COMPANY_SEARCH: '/placements/companies/search/',
      STUDENT_PLACEMENT_SUBMIT: '/placements/submit/',
      INVITE_SUPERVISOR: '/auth/invite/',
      WP_STUDENTS: '/placements/my-students/',
      WP_LOGS: '/logs/supervisor/',
      WP_LOG_REVIEW: (id) => `/logs/supervisor/${id}/review/`,
      WP_EVALUATIONS: '/evaluations/workplace/',
      WP_EVALUATION_DETAIL: (id) => `/evaluations/workplace/${id}/`,
    }
  };
});
