import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Mail, Building, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import rbuLogo from '@/assets/rbu-logo.png';

// Google "G" SVG — official brand colours, no external network request
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'MBA / Management Studies',
];

type Screen = 'main' | 'department' | 'email';

// Defined outside the component so it's stable across renders (prevents focus loss)
const PageWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 p-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
    </div>
    <Card className="w-full max-w-md relative shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4">
          <img src={rbuLogo} alt="Ramdeobaba University Logo" className="h-24 w-24 object-contain mx-auto" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Faculty E-Notice Board</CardTitle>
        <CardDescription className="text-muted-foreground mt-1">Ramdeobaba University, Nagpur</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-8">{children}</CardContent>
    </Card>
  </div>
);

const PasswordScreen: React.FC = () => {
  const { login, loginWithGoogle, completeGoogleRegistration, sendPasswordReset } = useAuth();

  const [screen, setScreen] = useState<Screen>('main');

  // Google sign-in
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Department selection (first Google sign-in)
  const [dept, setDept] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [prefillDept, setPrefillDept] = useState<string | undefined>();

  // Legacy email/password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Forgot password
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError('');
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) return; // onAuthStateChanged routes away
    if (result.needsDepartment) {
      setPrefillDept(result.allowlistDepartment);
      setDept(result.allowlistDepartment ?? '');
      setScreen('department');
      return;
    }
    if (result.error) setGoogleError(result.error);
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError('');
    if (!dept) { setDeptError('Please select your department.'); return; }
    setDeptLoading(true);
    const result = await completeGoogleRegistration(dept);
    setDeptLoading(false);
    if (!result.success) setDeptError(result.error ?? 'Failed to save profile. Please try again.');
    // On success onAuthStateChanged fires and routes to the app
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailLoading(true);
    const result = await login(email.trim(), password);
    setEmailLoading(false);
    if (!result.success) setEmailError(result.error ?? 'Login failed.');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    const result = await sendPasswordReset(forgotEmail.trim() || email.trim());
    setForgotLoading(false);
    if (result.success) {
      setForgotSent(true);
    } else {
      setForgotError(result.error ?? 'Failed to send reset email.');
    }
  };

  // ── Screen: Department (first sign-in for an allowlisted user) ────────────────
  if (screen === 'department') {
    return (
      <PageWrap>
        <div className="space-y-5 mt-2">
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">One last step!</p>
            <p className="text-sm text-muted-foreground">
              Confirm your department. Your name and email are already verified via Google.
            </p>
          </div>
          <form onSubmit={handleDepartmentSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium">Department</Label>
              <Select value={dept} onValueChange={v => { setDept(v); setDeptError(''); }} required>
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Select your department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {prefillDept && (
                <p className="text-xs text-muted-foreground">Pre-filled by admin — change if needed.</p>
              )}
            </div>
            {deptError && <p className="text-sm text-destructive">{deptError}</p>}
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={deptLoading || !dept}>
              {deptLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : 'Enter Dashboard'}
            </Button>
          </form>
        </div>
      </PageWrap>
    );
  }

  // ── Screen: Legacy email/password (admin fallback) ────────────────────────────
  if (screen === 'email') {
    // ── Forgot password sub-screen ────────────────────────────────────────────
    if (forgotMode) {
      return (
        <PageWrap>
          <div className="space-y-5 mt-2">
            {forgotSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-green-500" />
                </div>
                <p className="font-semibold text-foreground">Reset email sent!</p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for a password reset link.
                </p>
                <button type="button"
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                  className="text-xs text-primary hover:underline">
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-foreground">Reset your password</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send a reset link.
                  </p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-foreground font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="forgot-email" type="email" placeholder="your@email.com"
                        value={forgotEmail || email}
                        onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                        className="pl-10 h-12" required autoFocus autoComplete="username" />
                    </div>
                    {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={forgotLoading}>
                    {forgotLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : 'Send Reset Link'}
                  </Button>
                  <button type="button"
                    onClick={() => { setForgotMode(false); setForgotError(''); }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                    ← Back to sign in
                  </button>
                </form>
              </>
            )}
          </div>
        </PageWrap>
      );
    }

    return (
      <PageWrap>
        <div className="space-y-5 mt-2">
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-3">
            <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is for <span className="font-semibold text-foreground">admin / legacy accounts</span> only.
              All faculty should use Google sign-in.
            </p>
          </div>
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-inp" className="text-foreground font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email-inp" type="email" placeholder="admin@rknec.edu"
                  value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  className="pl-10 h-12" required autoComplete="username" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-inp" className="text-foreground font-medium">Password</Label>
                <button type="button"
                  onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotError(''); }}
                  className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password-inp" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={e => { setPassword(e.target.value); setEmailError(''); }}
                  className={cn('pl-10 pr-10 h-12', emailError && 'border-destructive ring-2 ring-destructive/20')}
                  required autoComplete="current-password" />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold"
              disabled={emailLoading || !email.trim() || !password}>
              {emailLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
            <button type="button" onClick={() => { setScreen('main'); setEmailError(''); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
              ← Back to Google sign-in
            </button>
          </form>
        </div>
      </PageWrap>
    );
  }

  // ── Screen: Main (default) ────────────────────────────────────────────────────
  return (
    <PageWrap>
      <div className="space-y-5 mt-2">
        <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/15 px-3.5 py-3">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sign in with your institutional Google account. Access is restricted to faculty
            emails pre-approved by the administrator — students cannot sign in.
          </p>
        </div>

        <Button type="button" variant="outline"
          className="w-full h-12 text-base font-medium gap-3 border-2 hover:bg-muted/60"
          onClick={handleGoogleSignIn} disabled={googleLoading}>
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <><GoogleIcon />Sign in with Google</>
          )}
        </Button>

        {googleError && (
          <p className="text-sm text-destructive text-center">{googleError}</p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button type="button" onClick={() => setScreen('email')}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
          Admin / legacy account? Sign in with email and password
        </button>
      </div>
    </PageWrap>
  );
};

export default PasswordScreen;
