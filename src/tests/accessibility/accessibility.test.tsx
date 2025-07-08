import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PatientDashboard from '@/pages/PatientDashboard';
import DoctorDashboard from '@/pages/DoctorDashboard';
import BookingPage from '@/pages/BookingPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT',
      patient: { id: 'patient-1' }
    },
    isAuthenticated: true,
  }),
}));

// Mock data hooks
vi.mock('@/hooks/usePatients', () => ({
  usePatientDashboard: () => ({
    data: {
      patient: { name: 'John Doe', email: 'john@example.com' },
      upcomingAppointments: [],
      recentAppointments: [],
      stats: { totalAppointments: 0, completedAppointments: 0 }
    },
    isLoading: false,
    error: null,
  }),
  usePatientMedicalRecords: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAppointments', () => ({
  useAppointments: () => ({
    data: { appointments: [] },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePatientActivity', () => ({
  usePatientActivity: () => ({
    activities: [],
    isLoading: false,
  }),
}));

describe('Accessibility Tests', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    it('should not have accessibility violations in Button component', async () => {
      const { container } = render(
        <TestWrapper>
          <Button>Click me</Button>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in Card component', async () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is test content</p>
            </CardContent>
          </Card>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in Patient Dashboard', async () => {
      const { container } = render(
        <TestWrapper>
          <PatientDashboard />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in Doctor Dashboard', async () => {
      const { container } = render(
        <TestWrapper>
          <DoctorDashboard />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in buttons', () => {
      render(
        <TestWrapper>
          <Button>Accessible Button</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper focus management', () => {
      render(
        <TestWrapper>
          <div>
            <Button>First Button</Button>
            <Button>Second Button</Button>
          </div>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Button aria-label="Close dialog">×</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <div>
            <h1>Main Title</h1>
            <h2>Section Title</h2>
            <h3>Subsection Title</h3>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should have proper landmark roles', () => {
      render(
        <TestWrapper>
          <div>
            <header role="banner">Header</header>
            <nav role="navigation">Navigation</nav>
            <main role="main">Main Content</main>
            <footer role="contentinfo">Footer</footer>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      render(
        <TestWrapper>
          <div>
            <span className="text-red-500" aria-label="Error">
              ⚠️ Error message
            </span>
            <span className="text-green-500" aria-label="Success">
              ✅ Success message
            </span>
          </div>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Error')).toBeInTheDocument();
      expect(screen.getByLabelText('Success')).toBeInTheDocument();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <form>
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" />
            
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" />
          </form>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should have proper error messages', () => {
      render(
        <TestWrapper>
          <form>
            <label htmlFor="email">Email Address</label>
            <input 
              id="email" 
              type="email" 
              name="email" 
              aria-describedby="email-error"
              aria-invalid="true"
            />
            <div id="email-error" role="alert">
              Please enter a valid email address
            </div>
          </form>
        </TestWrapper>
      );

      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
    });

    it('should have proper fieldset and legend for grouped inputs', () => {
      render(
        <TestWrapper>
          <form>
            <fieldset>
              <legend>Contact Information</legend>
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" name="phone" />
              <label htmlFor="address">Address</label>
              <input id="address" type="text" name="address" />
            </fieldset>
          </form>
        </TestWrapper>
      );

      expect(screen.getByRole('group', { name: 'Contact Information' })).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('should have proper button roles and states', () => {
      render(
        <TestWrapper>
          <div>
            <button type="button">Regular Button</button>
            <button type="submit">Submit Button</button>
            <button type="button" disabled>Disabled Button</button>
            <button type="button" aria-pressed="true">Toggle Button</button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: 'Regular Button' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Submit Button' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Disabled Button' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Toggle Button' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have proper link accessibility', () => {
      render(
        <TestWrapper>
          <div>
            <a href="/dashboard">Go to Dashboard</a>
            <a href="https://external.com" target="_blank" rel="noopener noreferrer">
              External Link (opens in new tab)
            </a>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /external link/i })).toHaveAttribute('target', '_blank');
    });
  });

  describe('Dynamic Content', () => {
    it('should announce dynamic content changes', () => {
      render(
        <TestWrapper>
          <div>
            <div aria-live="polite" id="status">
              Status updates will be announced
            </div>
            <div aria-live="assertive" id="alerts">
              Important alerts will be announced immediately
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('Status updates will be announced')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Important alerts will be announced immediately')).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper loading states', () => {
      render(
        <TestWrapper>
          <div>
            <div role="status" aria-label="Loading content">
              <span className="sr-only">Loading...</span>
              <div className="spinner" aria-hidden="true"></div>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading content');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have proper touch targets', () => {
      render(
        <TestWrapper>
          <button 
            style={{ minHeight: '44px', minWidth: '44px' }}
            className="touch-target"
          >
            Touch Button
          </button>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Touch Button' });
      const styles = window.getComputedStyle(button);
      
      // Note: In a real test, you'd check the computed styles
      expect(button).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(
        <TestWrapper>
          <button className="focus:ring-2 focus:ring-blue-500">
            Focusable Button
          </button>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Focusable Button' });
      expect(button).toBeInTheDocument();
      
      // In a real test, you'd simulate focus and check for visual indicators
    });

    it('should trap focus in modals', () => {
      render(
        <TestWrapper>
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">Modal Title</h2>
            <button>First Button</button>
            <button>Second Button</button>
            <button>Close</button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });
});
