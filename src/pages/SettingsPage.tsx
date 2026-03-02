import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Tv, 
  Palette, 
  Save,
  RotateCcw,
  Monitor,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { changePassword, setPassword, hasPasswordProvider, faculty } = useAuth();
  const [settings, setSettings] = useState({
    slideDuration: "10",
    defaultCategory: "all",
    autoRefresh: "30",
  });

  // Password form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPwd.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    const result = hasPasswordProvider
      ? await changePassword(currentPwd, newPwd)
      : await setPassword(newPwd);
    setPwdLoading(false);
    if (result.success) {
      toast({ title: hasPasswordProvider ? 'Password changed' : 'Password set', description: 'Your password has been updated successfully.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } else {
      setPwdError(result.error ?? 'Failed to update password.');
    }
  };

  const handleSave = () => {
    // In a real app, this would save to database/localStorage
    localStorage.setItem("rbu-notice-settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      slideDuration: "10",
      defaultCategory: "all",
      autoRefresh: "30",
    });
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults.",
    });
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure system preferences"
    >
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        <div className="grid gap-6">
          {/* TV Display Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-primary" />
                <CardTitle>TV Display Settings</CardTitle>
              </div>
              <CardDescription>
                Configure how notices appear on the TV display screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slideDuration">Slide Duration (seconds)</Label>
                  <Input
                    id="slideDuration"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.slideDuration}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, slideDuration: e.target.value }))
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    How long each notice displays (5-60 seconds)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoRefresh">Auto Refresh Interval (seconds)</Label>
                  <Input
                    id="autoRefresh"
                    type="number"
                    min="10"
                    max="300"
                    value={settings.autoRefresh}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, autoRefresh: e.target.value }))
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Check for new notices every X seconds
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Default Category Filter</Label>
                <Select
                  value={settings.defaultCategory}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, defaultCategory: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-xs h-11">
                    <SelectValue placeholder="Select default category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="spiritual">Spiritual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default category shown on the dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Theme Preview</CardTitle>
              </div>
              <CardDescription>
                Current RBU color scheme (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-primary" />
                    <div>
                      <p className="text-sm font-medium">Primary Orange</p>
                      <p className="text-xs text-muted-foreground">#F36F27</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-secondary" />
                    <div>
                      <p className="text-sm font-medium">Dark Blue</p>
                      <p className="text-xs text-muted-foreground">#0A2756</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-accent" />
                    <div>
                      <p className="text-sm font-medium">Light Orange</p>
                      <p className="text-xs text-muted-foreground">#FAA292</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Theme follows system preference (Light/Dark mode)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>System Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <Badge variant="secondary">1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <Badge variant="outline">Development</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password & Security — admins only */}
          {faculty?.role === 'admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <CardTitle>Password &amp; Security</CardTitle>
              </div>
              <CardDescription>
                {hasPasswordProvider
                  ? 'Change your account password. You will need your current password.'
                  : 'You signed in with Google. Set a password to also sign in with email.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSave} className="space-y-4 max-w-sm">
                {hasPasswordProvider && (
                  <div className="space-y-1.5">
                    <Label htmlFor="current-pwd">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="current-pwd" type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPwd} onChange={e => { setCurrentPwd(e.target.value); setPwdError(''); }}
                        className="pl-10 pr-10 h-11" required />
                      <button type="button" tabIndex={-1} onClick={() => setShowCurrent(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="new-pwd">{hasPasswordProvider ? 'New Password' : 'Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-pwd" type={showNew ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(''); }}
                      className="pl-10 pr-10 h-11" required />
                    <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pwd">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-pwd" type="password" placeholder="Repeat password"
                      value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }}
                      className="pl-10 h-11" required />
                  </div>
                </div>
                {pwdError && <p className="text-sm text-destructive">{pwdError}</p>}
                <Button type="submit" disabled={pwdLoading || !newPwd || !confirmPwd || (hasPasswordProvider && !currentPwd)} className="gap-2">
                  {pwdLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (<><KeyRound className="h-4 w-4" />{hasPasswordProvider ? 'Change Password' : 'Set Password'}</>)}
                </Button>
              </form>
            </CardContent>
          </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
