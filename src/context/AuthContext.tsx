import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  /** New Google user — UI should collect department before creating profile */
  needsDepartment?: boolean;
  /** Allowlist entry already has a department hint stored by admin */
  allowlistDepartment?: string;
}

interface AuthContextType extends AuthState {
  /** Sign in with email + password (legacy / admin fallback) */
  login: (email: string, password: string) => Promise<LoginResult>;
  /** Sign in via Google OAuth.
   *  - Email must be in the admin-managed allowlist.
   *  - Returning approved users are signed in immediately.
   *  - New allowlisted users get needsDepartment:true so the UI can collect their department.
   */
  loginWithGoogle: () => Promise<LoginResult>;
  /** Called after loginWithGoogle returns needsDepartment:true — creates auto-approved profile */
  completeGoogleRegistration: (department: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateFaculty: (updates: Partial<Faculty>) => Promise<void>;
  /** Re-authenticates then updates Firebase Auth password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<LoginResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level Google provider — reusable, stateless
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/** Check if an email exists in the admin-managed allowlist collection */
const checkAllowlist = async (email: string): Promise<{ allowed: boolean; department?: string }> => {
  try {
    const snap = await getDoc(doc(db, 'allowlist', email.toLowerCase()));
    if (snap.exists()) {
      return { allowed: true, department: (snap.data() as { department?: string }).department };
    }
    return { allowed: false };
  } catch {
    return { allowed: false };
  }
};

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
  // Holds the Firebase User between loginWithGoogle() → completeGoogleRegistration()
  const pendingGoogleUserRef = useRef<User | null>(null);

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

  // ── Google OAuth ─────────────────────────────────────────────────────────────

  const loginWithGoogle = async (): Promise<LoginResult> => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      const email = (user.email ?? '').toLowerCase();

      // 1. Allowlist gate — only admin-pre-approved emails can proceed
      const { allowed, department: allowlistDept } = await checkAllowlist(email);
      if (!allowed) {
        await signOut(auth);
        return {
          success: false,
          error:
            'Your email is not on the faculty allowlist. Contact the administrator to be added.',
        };
      }

      // 2. Check existing profile
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // First sign-in for this allowlisted person — stay signed-in, collect department
        pendingGoogleUserRef.current = user;
        return { success: false, needsDepartment: true, allowlistDepartment: allowlistDept };
      }

      // Profile exists — onAuthStateChanged handles the rest
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return { success: false, error: '' }; // user dismissed — no toast
      }
      if (code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'Popup was blocked. Please allow popups for this site and try again.',
        };
      }
      if (code === 'auth/account-exists-with-different-credential') {
        return {
          success: false,
          error:
            'An account already exists with this email using a different sign-in method.',
        };
      }
      console.error('Google sign-in error:', err);
      return { success: false, error: 'Google sign-in failed. Please try again.' };
    }
  };

  const completeGoogleRegistration = async (department: string): Promise<LoginResult> => {
    const user = pendingGoogleUserRef.current;
    if (!user) {
      return { success: false, error: 'Session expired. Please try signing in again.' };
    }
    try {
      // Auto-approved — admin already vetted this email by adding it to the allowlist
      const approvedProfile: FirestoreProfile = {
        name: toTitleCase(user.displayName ?? user.email?.split('@')[0] ?? 'Faculty'),
        department: department.trim(),
        email: (user.email ?? '').toLowerCase(),
        role: 'faculty',
        status: 'approved',
        createdAt: serverTimestamp() as unknown as Timestamp,
      };
      await setDoc(doc(db, 'profiles', user.uid), approvedProfile);
      pendingGoogleUserRef.current = null;
      // Don't sign out — onAuthStateChanged will pick up the new approved profile
      // and set isAuthenticated = true automatically
      return { success: true };
    } catch (err) {
      console.error('completeGoogleRegistration error:', err);
      await signOut(auth).catch(() => {});
      pendingGoogleUserRef.current = null;
      return { success: false, error: 'Failed to create your profile. Please try again.' };
    }
  };

  const register = async (
    _email: string,
    _password: string,
    _name: string,
    _department: string
  ): Promise<LoginResult> => {
    // Self-registration removed — admin must add email to allowlist first
    return { success: false, error: 'Self-registration is disabled. Contact the administrator.' };
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
    <AuthContext.Provider value={{ ...authState, login, loginWithGoogle, completeGoogleRegistration, logout, updateFaculty, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
