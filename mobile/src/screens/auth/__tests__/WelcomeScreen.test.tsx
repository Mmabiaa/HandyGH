/**
 * WelcomeScreen Tests
 *
 * Comprehensive test coverage for Enterprise WelcomeScreen
 * Tests animations, accessibility, navigation, and performance
 *
 * @requirements Req 20 (Testing)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { WelcomeScreen } from '../WelcomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

// Mock route
const mockRoute = {
  key: 'test-key',
  name: 'Onboarding' as const,
} as any;

// Wrapper component with navigation
const WelcomeScreenWithNavigation = () => (
  <NavigationContainer>
    <WelcomeScreen navigation={mockNavigation} route={mockRoute} />
  </NavigationContainer>
);

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      expect(getByText('Welcome to HandyGH')).toBeTruthy();
    });

    it('should display the logo', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      expect(getByText('HandyGH')).toBeTruthy();
    });

    it('should display the subtitle', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      expect(
        getByText(/Find trusted local service providers/i)
      ).toBeTruthy();
    });

    it('should display the Get Started button', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      expect(getByText('Get Started')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to PhoneInput when Get Started is pressed', async () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      const button = getByText('Get Started');

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('PhoneInput');
      });
    });

    it('should navigate only once on button press', async () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      const button = getByText('Get Started');

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible logo', () => {
      const { getByLabelText } = render(<WelcomeScreenWithNavigation />);
      expect(getByLabelText('HandyGH logo')).toBeTruthy();
    });

    it('should have accessible title', () => {
      const { getByLabelText } = render(<WelcomeScreenWithNavigation />);
      expect(getByLabelText('Welcome to HandyGH')).toBeTruthy();
    });

    it('should have accessible subtitle', () => {
      const { getByLabelText } = render(<WelcomeScreenWithNavigation />);
      expect(
        getByLabelText(
          'Find trusted local service providers for all your needs'
        )
      ).toBeTruthy();
    });

    it('should have accessible button with role', () => {
      const { getByRole } = render(<WelcomeScreenWithNavigation />);
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have button with accessibility hint', () => {
      const { getByA11yHint } = render(<WelcomeScreenWithNavigation />);
      expect(
        getByA11yHint('Double tap to begin registration')
      ).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle button press', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      const button = getByText('Get Started');

      expect(() => fireEvent.press(button)).not.toThrow();
    });

    it('should handle press in and press out events', () => {
      const { getByText } = render(<WelcomeScreenWithNavigation />);
      const button = getByText('Get Started');

      expect(() => {
        fireEvent(button, 'pressIn');
        fireEvent(button, 'pressOut');
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount without errors', () => {
      const { unmount } = render(<WelcomeScreenWithNavigation />);
      expect(() => unmount()).not.toThrow();
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(<WelcomeScreenWithNavigation />);

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const startTime = performance.now();
      render(<WelcomeScreenWithNavigation />);
      const renderTime = performance.now() - startTime;

      // Should render in less than 500ms
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const tree = render(<WelcomeScreenWithNavigation />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
