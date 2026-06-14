import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SupervisorLayout from '../SupervisorLayout';
import useAuth from '../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock react-router-dom useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SupervisorLayout Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { full_name: 'Dr. Jane Doe', role: 'academic_supervisor' },
      logout: jest.fn()
    });
  });

  test('renders the updated ILES branding logo and title', () => {
    render(
      <MemoryRouter>
        <SupervisorLayout />
      </MemoryRouter>
    );

    // Verify ILES branding title text is present
    expect(screen.getByText('ILES')).toBeInTheDocument();
    
    // Verify ILES Logo image is rendered
    const logoImg = screen.getByAltText('ILES Logo');
    expect(logoImg).toBeInTheDocument();

    // Verify sidebar subtitle
    expect(screen.getAllByText('Academic Supervisor').length).toBeGreaterThan(0);
    
    // Verify user name in topbar
    expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
  });
});
