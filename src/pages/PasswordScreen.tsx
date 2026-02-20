import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import rbuLogo from '@/assets/rbu-logo.png';

const PasswordScreen: React.FC = () => {
  const { login } = useAuth();
  const [step, setStep] = useState<'name' | 'password'>('name');
  const [facultyName, setFacultyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facultyName.trim()) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const success = await login(password, facultyName.trim());
    if (!success) {
      setError(true);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('name');
    setPassword('');
    setError(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 pt-8">
          {/* RBU Logo */}
          <div className="mx-auto mb-4">
            <img
              src={rbuLogo}
              alt="Ramdeobaba University Logo"
              className="h-24 w-24 object-contain mx-auto"
            />
          </div>

          <CardTitle className="text-2xl font-bold text-foreground">
            Faculty E-Notice Board
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Ramdeobaba University, Nagpur
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            {step === 'name'
              ? 'Enter your name to get started'
              : `Welcome, ${facultyName}!`}
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {step === 'name' ? (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facultyName" className="text-foreground font-medium">
                  Your Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facultyName"
                    type="text"
                    placeholder="Enter your full name"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="pl-10 h-12 border-border focus:border-primary focus:ring-primary"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                disabled={!facultyName.trim()}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Department Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change name
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className={cn(
                      'pl-10 pr-10 h-12 border-border focus:border-primary focus:ring-primary',
                      error && 'border-destructive shake ring-2 ring-destructive/20'
                    )}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-destructive">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Demo password: <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">faculty123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordScreen;
