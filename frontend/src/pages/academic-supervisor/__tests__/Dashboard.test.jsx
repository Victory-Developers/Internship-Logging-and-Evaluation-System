import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SupervisorDashboard from '../Dashboard';
import api from '../../../api/axios';

// Mock api from api/axios
jest.mock('../../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('SupervisorDashboard Component', () => {
  test('renders skeleton load placeholders initially when loading is true', () => {
    // Keep API promise unresolved to keep loading state active
    api.get.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );

    // Verify page title is present
    expect(screen.getByText('Academic Supervisor Dashboard')).toBeInTheDocument();

    // Verify skeleton elements are present
    const skeletons = document.querySelectorAll('.skeleton-box');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('renders stats and recent activities after API call completes successfully', async () => {
    // Mock successful API response
    api.get.mockResolvedValue({
      data: {
        stats: {
          total_students: 5,
          pending_reviews: 2,
          completed_evaluations: 3,
          active_placements: 4
        },
        recent_activity: [
          { description: 'Academic evaluation completed for John Doe', time: '2026-06-15 10:00' },
          { description: 'Weekly log submitted by Jane Smith (Week 3)', time: '2026-06-15 09:30' }
        ]
      }
    });

    render(
      <MemoryRouter>
        <SupervisorDashboard />
      </MemoryRouter>
    );

    // Wait for the stats to load and verify the statistics count values are rendered
    await waitFor(() => {
      expect(screen.getByText('Assigned Students')).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument(); // total_students
    expect(screen.getByText('2')).toBeInTheDocument(); // pending_reviews
    expect(screen.getByText('3')).toBeInTheDocument(); // completed_evaluations
    expect(screen.getByText('4')).toBeInTheDocument(); // active_placements

    // Verify recent activity descriptions
    expect(screen.getByText('Academic evaluation completed for John Doe')).toBeInTheDocument();
    expect(screen.getByText('Weekly log submitted by Jane Smith (Week 3)')).toBeInTheDocument();
  });
});
