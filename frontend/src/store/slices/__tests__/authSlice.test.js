import authReducer, {
  setCredentials,
  logout,
  setLoading,
  setError,
  clearError,
} from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    userInfo: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const user = { id: 1, name: 'Test User' };
    const token = 'test-token';
    const action = setCredentials({ user, token });
    const expectedState = {
      userInfo: user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle logout', () => {
    const stateWithAuth = {
      userInfo: { id: 1, name: 'Test User' },
      token: 'test-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    expect(authReducer(stateWithAuth, logout())).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    expect(authReducer(initialState, setLoading(true))).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('should handle setError and clearError', () => {
    const error = 'An error occurred';
    const stateWithError = authReducer(initialState, setError(error));
    expect(stateWithError.error).toBe(error);

    const stateWithoutError = authReducer(stateWithError, clearError());
    expect(stateWithoutError.error).toBeNull();
  });
});