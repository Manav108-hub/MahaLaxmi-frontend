// hooks/useAuth.ts
'use client'

import { User } from '@/lib/types';
import { authService } from '@/services/authService';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// --- UTILITIES: CACHE AND LOCAL STORAGE ---

const authCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCachedData = (key: string) => {
  const cached = authCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: unknown) => {
  authCache.set(key, { data, timestamp: Date.now() });
};

const clearCache = () => {
  authCache.clear();
};

// Helper to safely read auth from LocalStorage
const getStoredAuth = <T extends User>() => {
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false };

  const storedUser = localStorage.getItem('user');
  const isAuthenticatedString = localStorage.getItem('isAuthenticated');
  const isAuthenticated = isAuthenticatedString === 'true';

  if (storedUser && isAuthenticated) {
    try {
      const user = JSON.parse(storedUser) as T;
      return { user, isAuthenticated: true };
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
    }
  }
  return { user: null, isAuthenticated: false };
};

// Helper to safely write auth to LocalStorage
const setStoredAuth = (user: User | null, token?: string) => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    if (token) {
      localStorage.setItem('token', token);
    }
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  }
};

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Check if current page is auth page
const isAuthPage = (pathname: string): boolean => {
  return ['/login', '/register', '/forgot-password', '/reset-password'].some(path => 
    pathname.startsWith(path)
  );
};

// --- HOOK: useCurrentUser ---

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
};

export function useCurrentUser(checkAuth: boolean = false) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>(initialState);
  const mounted = useRef(true);
  const isFetching = useRef(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchUser = useCallback(async (forceApi: boolean = false) => {
    if (!mounted.current || isFetching.current) return;
    
    isFetching.current = true;

    try {
      // If we're on an auth page and not forcing API, skip validation
      if (isAuthPage(pathname) && !forceApi) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
        }));
        isFetching.current = false;
        return;
      }

      // 1. Check localStorage first for immediate UI update
      const { user: storedUser, isAuthenticated: storedIsAuthenticated } = getStoredAuth<User>();
      
      if (storedIsAuthenticated && storedUser) {
        setState(prev => ({
          ...prev,
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        }));
      }

      // 2. If it's a public page AND not forcing API, stop here
      if (!checkAuth && !forceApi) {
        isFetching.current = false;
        return;
      }

      // 3. Check if we have a token
      const token = getToken();
      if (!token) {
        clearCache();
        setStoredAuth(null);
        if (mounted.current) {
          setState(prev => ({
            ...prev,
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isInitialized: true,
          }));
        }
        isFetching.current = false;
        return;
      }

      // 4. Check cache
      const cached = getCachedData('currentUser');
      if (cached && !forceApi) {
        if (mounted.current) {
          setState({
            user: cached as User,
            isLoading: false,
            isAuthenticated: true,
            isInitialized: true,
            error: null,
          });
        }
        isFetching.current = false;
        return;
      }

      // 5. API Call for validation
      if (mounted.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      const response = await authService.getProfile();
      
      if (response.success && response.data && mounted.current) {
        const userData = response.data.user || response.data;
        const newToken = response.data.token || getToken();
        
        setCachedData('currentUser', userData);
        setStoredAuth(userData, newToken!);
        
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          isInitialized: true,
          error: null,
        });
      } else {
        // API failed validation
        clearCache();
        setStoredAuth(null);
        if (mounted.current) {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isInitialized: true,
            error: response.error || 'Authentication failed',
          });
        }
      }
    } catch (error: unknown) {
      console.error('Auth fetch error:', error);
      clearCache();
      setStoredAuth(null);
      if (mounted.current) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isInitialized: true,
          error: error instanceof Error ? error.message : 'Failed to authenticate',
        });
      }
    } finally {
      isFetching.current = false;
    }
  }, [checkAuth, pathname]);

  const setUser = useCallback((user: User | null, token?: string) => {
    if (!mounted.current) return;
    
    setStoredAuth(user, token);
    
    if (user) {
      setCachedData('currentUser', user);
      setState({ 
        user, 
        isLoading: false, 
        isAuthenticated: true, 
        isInitialized: true,
        error: null,
      });
    } else {
      clearCache();
      setState({ 
        user: null, 
        isLoading: false, 
        isAuthenticated: false, 
        isInitialized: true,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Auto-redirect for protected routes
  useEffect(() => {
    if (checkAuth && state.isInitialized && !state.isLoading && !state.isAuthenticated) {
      if (!isAuthPage(pathname)) {
        router.push('/login');
      }
    }
  }, [checkAuth, state.isAuthenticated, state.isInitialized, state.isLoading, pathname, router]);

  return {
    data: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    error: state.error,
    refetch: () => fetchUser(true),
    setUser,
  };
}

// --- SIMPLIFIED HOOKS ---

// hooks/useAuth.ts - Updated useLogin function
export function useLogin() {
  const router = useRouter();
  const [state, setState] = useState({
    isPending: false,
    isError: false,
    error: null as string | null,
  });

  const mutateAsync = useCallback(async (credentials: { username: string; password: string }) => {
    setState({ isPending: true, isError: false, error: null });

    try {
      const response = await authService.login(credentials);
      
      // Check if login was successful
      if (response.success) {
        // Get user data and token - handle different response structures
        const userData = response.data?.user || response.data || response.user;
        const token = response.data?.token || response.token || response.data?.accessToken;
        
        if (userData) {
          // ✅ Save to localStorage and update cache immediately upon login success
          setStoredAuth(userData as User, token);
          setCachedData('currentUser', userData);
          
          setState({ isPending: false, isError: false, error: null });
          return response;
        } else {
          // If we have success but no user data, still consider it a success
          // but log a warning
          console.warn('Login successful but no user data returned');
          setState({ isPending: false, isError: false, error: null });
          return response;
        }
      } else {
        // If response.success is false, throw an error with the message
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      clearCache();
      setStoredAuth(null);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({ 
        isPending: false, 
        isError: true, 
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  return {
    mutateAsync,
    isPending: state.isPending,
    isError: state.isError,
    error: state.error,
  };
}

// hooks/useAuth.ts - Updated useAuth function
export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser(requireAuth);
  const loginMutation = useLogin();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
      
      if (response.success) {
        // Try to get user data from response
        const userData = response.data?.user || response.data || response.user;
        const token = response.data?.token || response.token || response.data?.accessToken;
        
        if (userData) {
          // ✅ Update current user state directly for immediate component re-render
          currentUser.setUser(userData, token);
        }
        
        // Force redirect after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        
        return response;
      }
      
      // If we get here, response.success is false
      throw new Error(response.message || 'Login failed');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [loginMutation, currentUser]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error: unknown) {
      console.error('Logout error:', error);
    } finally {
      currentUser.setUser(null);
      window.location.href = '/login';
      setIsLoggingOut(false);
    }
  }, [currentUser]);

  return {
    user: currentUser.data,
    isLoading: currentUser.isLoading,
    isAuthenticated: currentUser.isAuthenticated,
    isInitialized: currentUser.isInitialized,
    error: currentUser.error || loginMutation.error,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut,
    refetchUser: currentUser.refetch,
  };
}