import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/config';
import { AuthState, Faculty, FirestoreProfile } from '@/integrations/firebase/types';
import { toTitleCase } from '@/lib/utils';

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  /** Sign in with individual email + password */
  login: (email: string, password: string) => Promise<LoginResult>;
  /** Self-register with pending status — admin must approve before site access */
  register: (email: string, password: string, name: string, department: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateFaculty: (updates: Partial<Faculty>) => Promise<void>;
  /** Re-authenticates then updates Firebase Auth password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<LoginResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// convert firestore profile to faculty type
const profileToFaculty = (uid: string, data: FirestoreProfile): Faculty => ({
  id: uid,
  name: data.name,
  department: data.department,
  email: data.email,
  phone: data.phone,
  profilePhotoUrl: data.profilePhotoUrl,
  role: data.role,
  status: data.status ?? 'approved', // legacy accounts without status field = approved
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    faculty: null,
    loading: true,
  });

  // Restore session on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data() as FirestoreProfile;
            const status = data.status ?? 'approved';
            // Block non-faculty/admin roles
            if (!['faculty', 'admin'].includes(data.role)) {
              await signOut(auth);
              setAuthState({ isAuthenticated: false, faculty: null, loading: false });
              return;
            }
            // Block pending / rejected accounts
            if (status !== 'approved') {
              await signOut(auth);
              setAuthState({ isAuthenticated: false, faculty: null, loading: false });
              return;
            }
            setAuthState({
              isAuthenticated: true,
              faculty: profileToFaculty(user.uid, data),
              loading: false,
            });
          } else {
            // Profile missing — this can happen during registration (race condition
            // between createUserWithEmailAndPassword and setDoc). Do NOT sign out
            // here; the register() function handles its own signOut after writing
            // the profile. Just mark as unauthenticated so the login screen shows.
            setAuthState({ isAuthenticated: false, faculty: null, loading: false });
          }
        } catch (err) {
          console.error('Error restoring session:', err instanceof Error ? err.message : err);
          setAuthState({ isAuthenticated: false, faculty: null, loading: false });
        }
      } else {
        setAuthState({ isAuthenticated: false, faculty: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data() as FirestoreProfile;
        const status = data.status ?? 'approved';

        if (!['faculty', 'admin'].includes(data.role)) {
          await signOut(auth);
          return { success: false, error: 'This account is not authorised as faculty.' };
        }
        if (status === 'pending') {
          await signOut(auth);
          return { success: false, error: 'Your account is awaiting admin approval. You will be able to log in once approved.' };
        }
        if (status === 'rejected') {
          await signOut(auth);
          return { success: false, error: 'Your access request was rejected. Please contact the administrator.' };
        }
        setAuthState({
          isAuthenticated: true,
          faculty: profileToFaculty(user.uid, data),
          loading: false,
        });
      } else {
        // No profile yet — sign out; registration flow should have created one
        await signOut(auth);
        return { success: false, error: 'No profile found. Please register first.' };
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Login error:', err);
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        return { success: false, error: 'No account found with this email.' };
      }
      if (code === 'auth/wrong-password') {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Try again later.' };
      }
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    department: string
  ): Promise<LoginResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      // Create pending profile — admin must approve before login is allowed
      const pendingProfile: FirestoreProfile = {
        name: toTitleCase(name),
        department: department.trim(),
        email: user.email || '',
        role: 'faculty',
        status: 'pending',
        createdAt: serverTimestamp() as unknown as Timestamp,
      };
      await setDoc(doc(db, 'profiles', user.uid), pendingProfile);

      // Sign out immediately — they can only log in after approval
      await signOut(auth);

      return { success: true };
    } catch (err: unknown) {
      console.error('Register error:', err);
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Try signing in.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const updateFaculty = async (updates: Partial<Faculty>): Promise<void> => {
    if (!authState.faculty) return;
    // Always normalise the display name to Title Case
    const normalised: Partial<Faculty> = {
      ...updates,
      ...(updates.name ? { name: toTitleCase(updates.name) } : {}),
    };
    const profileRef = doc(db, 'profiles', authState.faculty.id);
    await updateDoc(profileRef, { ...normalised, updatedAt: serverTimestamp() });
    setAuthState(prev => ({
      ...prev,
      faculty: prev.faculty ? { ...prev.faculty, ...normalised } : null,
    }));
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<LoginResult> => {
    const user = auth.currentUser;
    if (!user || !user.email) return { success: false, error: 'No user is signed in.' };
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { success: false, error: 'Current password is incorrect.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'New password must be at least 6 characters.' };
      }
      return { success: false, error: 'Failed to change password. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, updateFaculty, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
