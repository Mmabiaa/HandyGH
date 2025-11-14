/**
 * useAuth Hook Tests
 * Tests authentication state management
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { AuthService } from '../../../../core/api/services/AuthService';
import { useAuthStore } from '../../../../core/store/authStore';

jest.mock('../../../../core/api/services/AuthService');
jest.mock('../../../../core/store/authStore');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('useAuth Hook', () => {
  const mockUser = {
    id: 'user-123',
    phoneNumber: '+233241234567',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'customer' as const,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the store
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
      setLoading: jest.fn(),
    });
  });

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should login user successfully', async () => {
    const mockLogin = jest.fn();
    const mockSetLoading = jest.fn();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: jest.fn(),
      updateUser: jest.fn(),
      setLoading: mockSetLoading,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(mockUser, 'access-token', 'refresh-token');
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockLogin).toHaveBeenCalledWith(mockUser, 'access-token', 'refresh-token');
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should logout user successfully', async () => {
    const mockLogout = jest.fn();
    const mockSetLoading = jest.fn();

    mockAuthService.logout.mockResolvedValue();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
      updateUser: jest.fn(),
      setLoading: mockSetLoading,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should update user profile', () => {
    const mockUpdateUser = jest.fn();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: mockUpdateUser,
      setLoading: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.updateUser({ firstName: 'Jane' });
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ firstName: 'Jane' });
  });

  it('should check authentication status', async () => {
    const mockSetLoading = jest.fn();

    mockAuthService.isAuthenticated.mockResolvedValue(true);

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
      setLoading: mockSetLoading,
    });

    const { result } = renderHook(() => useAuth());

    let isAuthenticated: boolean = false;

    await act(async () => {
      isAuthenticated = await result.current.checkAuthentication();
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    expect(isAuthenticated).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle login error', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
    const mockSetLoading = jest.fn();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: jest.fn(),
      updateUser: jest.fn(),
      setLoading: mockSetLoading,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login(mockUser, 'access-token', 'refresh-token');
      } catch (error: any) {
        expect(error.message).toBe('Login failed');
      }
    });

    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should handle logout error', async () => {
    const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
    const mockSetLoading = jest.fn();

    mockAuthService.logout.mockRejectedValue(new Error('API error'));

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
      updateUser: jest.fn(),
      setLoading: mockSetLoading,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.logout();
      } catch (error: any) {
        expect(error.message).toBe('Logout failed');
      }
    });

    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
