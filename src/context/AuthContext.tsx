import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/config';
import { AuthState, Faculty, FirestoreProfile } from '@/integrations/firebase/types';

interface AuthContextType extends AuthState {
  login: (password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateFaculty: (updates: Partial<Faculty>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firestore profile doc to Faculty app type
const profileToFaculty = (uid: string, data: FirestoreProfile): Faculty => ({
  id: uid,
  name: data.name,
  department: data.department,
  email: data.email,
  phone: data.phone,
  profilePhotoUrl: data.profilePhotoUrl,
  role: data.role,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    faculty: null,
    loading: true,
  });

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Fetch faculty profile from Firestore
        try {
          // Restore name from sessionStorage if it's a shared account
          const storedName = sessionStorage.getItem('faculty_name');
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const facultyData = profileSnap.data() as FirestoreProfile;
            const faculty = profileToFaculty(user.uid, {
              ...facultyData,
              name: storedName || facultyData.name
            });
            setAuthState({ isAuthenticated: true, faculty, loading: false });
          } else {
            // Profile doesn't exist yet — create a minimal one
            const newProfile: FirestoreProfile = {
              name: storedName || user.displayName || user.email?.split('@')[0] || 'Faculty',
              department: 'Computer Science & Engineering',
              email: user.email || '',
              role: 'faculty',
              createdAt: serverTimestamp() as ReturnType<typeof serverTimestamp>,
            };
            await setDoc(profileRef, newProfile);
            setAuthState({
              isAuthenticated: true,
              faculty: profileToFaculty(user.uid, newProfile),
              loading: false,
            });
          }
        } catch (err) {
          console.error('Error fetching profile:', err instanceof Error ? err.message : err);
          setAuthState({ isAuthenticated: false, faculty: null, loading: false });
        }
      } else {
        setAuthState({ isAuthenticated: false, faculty: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (password: string, name: string): Promise<boolean> => {
    try {
      const sharedEmail = import.meta.env.VITE_SHARED_FACULTY_EMAIL;
      const sharedPass = import.meta.env.VITE_SHARED_FACULTY_PASS;

      // Validate common password
      if (password !== sharedPass) {
        return false;
      }

      // Log in with shared Firebase account
      await signInWithEmailAndPassword(auth, sharedEmail, password);

      // Store the name for this session
      sessionStorage.setItem('faculty_name', name);

      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    sessionStorage.removeItem('faculty_name');
    await signOut(auth);
  };

  const updateFaculty = async (updates: Partial<Faculty>): Promise<void> => {
    if (!authState.faculty) return;
    const profileRef = doc(db, 'profiles', authState.faculty.id);
    await updateDoc(profileRef, { ...updates, updatedAt: serverTimestamp() });
    setAuthState(prev => ({
      ...prev,
      faculty: prev.faculty ? { ...prev.faculty, ...updates } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateFaculty }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
