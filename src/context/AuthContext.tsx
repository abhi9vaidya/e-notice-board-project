import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthState, Faculty } from '@/types/notice';
import { DEPARTMENT_PASSWORD } from '@/data/mockNotices';

const FACULTY_STORAGE_KEY = 'facultyProfiles';

interface AuthContextType extends AuthState {
  login: (password: string, name: string) => boolean;
  logout: () => void;
  updateFaculty: (updates: Partial<Faculty>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get stored faculty profiles from localStorage
const getStoredProfiles = (): Record<string, Faculty> => {
  try {
    const stored = localStorage.getItem(FACULTY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save faculty profiles to localStorage
const saveStoredProfiles = (profiles: Record<string, Faculty>) => {
  localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(profiles));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    faculty: null,
  });

  const login = useCallback((password: string, name: string): boolean => {
    if (password === DEPARTMENT_PASSWORD) {
      const profiles = getStoredProfiles();
      const normalizedName = name.trim().toLowerCase();
      
      // Check if faculty profile exists
      let faculty: Faculty;
      if (profiles[normalizedName]) {
        // Use existing profile (preserves photo, email, phone, etc.)
        faculty = profiles[normalizedName];
      } else {
        // Create new profile
        faculty = {
          id: `faculty-${Date.now()}`,
          name: name.trim(),
          department: 'Computer Science & Engineering',
          email: '',
          phone: '',
          profilePhoto: '',
        };
        profiles[normalizedName] = faculty;
        saveStoredProfiles(profiles);
      }
      
      setAuthState({
        isAuthenticated: true,
        faculty,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      faculty: null,
    });
  }, []);

  const updateFaculty = useCallback((updates: Partial<Faculty>) => {
    setAuthState(prev => {
      if (!prev.faculty) return prev;
      
      const updatedFaculty = { ...prev.faculty, ...updates };
      
      // Persist to localStorage
      const profiles = getStoredProfiles();
      const normalizedName = prev.faculty.name.trim().toLowerCase();
      profiles[normalizedName] = updatedFaculty;
      saveStoredProfiles(profiles);
      
      return {
        ...prev,
        faculty: updatedFaculty,
      };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateFaculty }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
