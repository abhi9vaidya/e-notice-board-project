import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Mail, User, Building, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import rbuLogo from '@/assets/rbu-logo.png';

type Mode = 'signin' | 'register';

const PasswordScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrorMsg('');
    setRegError('');
    setRegSuccess(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    const result = await login(email.trim(), password);
    if (!result.success) {
      setErrorMsg(result.error ?? 'Login failed.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    const emailLower = regEmail.trim().toLowerCase();
    if (!emailLower.endsWith('@rknec.edu') && !emailLower.endsWith('@rbunagpur.in')) {
      setRegError('Email must end with @rknec.edu or @rbunagpur.in.');
      return;
    }
    setRegLoading(true);
    const result = await register(emailLower, regPassword, regName.trim(), regDept.trim());
    setRegLoading(false);
    if (result.success) {
      setRegSuccess(true);
    } else {
      setRegError(result.error ?? 'Registration failed.');
    }
  };

  return (
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

        <CardContent className="pt-2">
          {/* Tab toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={cn(
                'flex-1 text-sm font-medium py-2 rounded-md transition-all',
                mode === 'signin'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={cn(
                'flex-1 text-sm font-medium py-2 rounded-md transition-all',
                mode === 'register'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Request Access
            </button>
          </div>

          {/* â”€â”€ Sign In â”€â”€ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@rknec.edu or you@rbunagpur.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                    className="pl-10 h-12"
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                    className={cn('pl-10 pr-10 h-12', errorMsg && 'border-destructive ring-2 ring-destructive/20')}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading || !email.trim() || !password}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')} className="text-primary hover:underline font-medium">
                  Request access
                </button>
              </p>
            </form>
          )}

          {/* â”€â”€ Request Access â”€â”€ */}
          {mode === 'register' && (
            <>
              {regSuccess ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-9 w-9 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">Request Submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your account is pending admin approval.<br />
                      You'll be able to sign in once it's approved.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => { setRegSuccess(false); switchMode('signin'); }}>
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-foreground font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-name" type="text" placeholder="Dr. Firstname Lastname"
                        value={regName} onChange={e => { setRegName(e.target.value); setRegError(''); }}
                        className="pl-10 h-11" required autoFocus />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <Label className="text-foreground font-medium">Department</Label>
                    <Select value={regDept} onValueChange={v => { setRegDept(v); setRegError(''); }} required>
                      <SelectTrigger className="h-11">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="Select department" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-foreground font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-email" type="email" placeholder="you@rknec.edu or you@rbunagpur.in"
                        value={regEmail} onChange={e => { setRegEmail(e.target.value); setRegError(''); }}
                        className="pl-10 h-11" required autoComplete="username" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-foreground font-medium">Set Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-password" type={showRegPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={regPassword} onChange={e => { setRegPassword(e.target.value); setRegError(''); }}
                        className="pl-10 pr-10 h-11" required autoComplete="new-password" />
                      <button type="button" tabIndex={-1}
                        onClick={() => setShowRegPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm" className="text-foreground font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-confirm" type="password" placeholder="Repeat password"
                        value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setRegError(''); }}
                        className="pl-10 h-11" required autoComplete="new-password" />
                    </div>
                  </div>

                  {regError && <p className="text-sm text-destructive">{regError}</p>}

                  <Button type="submit" className="w-full h-12 text-base font-semibold mt-1"
                    disabled={regLoading || !regName.trim() || !regEmail.trim() || !regPassword || !regConfirm || !regDept.trim()}>
                    {regLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : 'Submit Access Request'}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="text-primary hover:underline font-medium">
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordScreen;
