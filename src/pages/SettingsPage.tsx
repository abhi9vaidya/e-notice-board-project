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
  MonitorPlay,
  LayoutGrid,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTVDisplaySettings, TV_SETTINGS_DEFAULTS, type TVDisplayMode } from "@/hooks/useTVDisplaySettings";
import { cn } from "@/lib/utils";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { changePassword, setPassword, hasPasswordProvider, faculty } = useAuth();
  const { settings: tvSettings, saveSettings: saveTVSettings, defaults: tvDefaults } = useTVDisplaySettings();

  // Local copy of TV settings for the form (saved only on "Save Settings" click)
  const [tvForm, setTVForm] = useState({ ...tvSettings });
  // Keep tvForm in sync if settings change externally (e.g., opened in another tab)
  React.useEffect(() => { setTVForm(s => ({ ...tvSettings, ...s })); }, []); // eslint-disable-line

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
    localStorage.setItem("rbu-notice-settings", JSON.stringify(settings));
    // Validate numeric TV form fields
    const parsed = {
      ...tvForm,
      singleHighDuration:        Math.max(5,  Math.min(300, Number(tvForm.singleHighDuration)        || tvDefaults.singleHighDuration)),
      singleMediumDuration:      Math.max(5,  Math.min(300, Number(tvForm.singleMediumDuration)      || tvDefaults.singleMediumDuration)),
      singleNormalDuration:      Math.max(5,  Math.min(300, Number(tvForm.singleNormalDuration)      || tvDefaults.singleNormalDuration)),
      multiNoticePageDuration:   Math.max(5,  Math.min(300, Number(tvForm.multiNoticePageDuration)   || tvDefaults.multiNoticePageDuration)),
      multiHighDuration:         Math.max(5,  Math.min(300, Number(tvForm.multiHighDuration)         || tvDefaults.multiHighDuration)),
      multiAchievementDuration:  Math.max(5,  Math.min(300, Number(tvForm.multiAchievementDuration)  || tvDefaults.multiAchievementDuration)),
      autoSingleDuration:        Math.max(15, Math.min(3600, Number(tvForm.autoSingleDuration)       || tvDefaults.autoSingleDuration)),
      autoMultiDuration:         Math.max(15, Math.min(3600, Number(tvForm.autoMultiDuration)        || tvDefaults.autoMultiDuration)),
    };
    saveTVSettings(parsed);
    setTVForm(parsed);
    toast({
      title: "Settings Saved",
      description: "TV display settings have been applied. Changes will reflect on the TV screen immediately.",
    });
  };

  const handleReset = () => {
    setSettings({
      slideDuration: "10",
      defaultCategory: "all",
      autoRefresh: "30",
    });
    setTVForm({ ...tvDefaults });
    saveTVSettings({ ...tvDefaults });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure system preferences"
    >
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        <div className="grid gap-6">
          {/* ── TV Display Mode ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-primary" />
                <CardTitle>TV Display Mode</CardTitle>
              </div>
              <CardDescription>
                Choose how the notice board presents content on the TV screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Mode selector */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Display Mode</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["single", "multi", "auto"] as TVDisplayMode[]).map(mode => {
                    const isActive = tvForm.displayMode === mode;
                    const icon = mode === "single" ? <MonitorPlay className="h-5 w-5" />
                                : mode === "multi"  ? <LayoutGrid className="h-5 w-5" />
                                : <RefreshCw className="h-5 w-5" />;
                    const label = mode === "single" ? "Slideshow" : mode === "multi" ? "Overview" : "Auto-Switch";
                    const desc  = mode === "single"
                      ? "One notice at a time, slides through all notices with configurable timers"
                      : mode === "multi"
                      ? "Shows all notices at once — high-priority hero on top, cards grid below"
                      : "Alternates between Slideshow and Overview on a schedule you define";
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTVForm(f => ({ ...f, displayMode: mode }))}
                        className={cn(
                          "flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:border-primary/40",
                          isActive ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                        )}
                      >
                        <div className={cn("flex items-center gap-2 font-bold text-sm",
                          isActive ? "text-primary" : "text-foreground")}>
                          {icon}
                          {label}
                          {isActive && <Badge variant="secondary" className="ml-auto text-[0.6rem] py-0">Active</Badge>}
                        </div>
                        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">{desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* ── Slideshow (single) settings ─────────────────────────────── */}
              {(tvForm.displayMode === "single" || tvForm.displayMode === "auto") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Slideshow Settings</h3>
                    <span className="text-xs text-muted-foreground ml-1">(per-priority durations)</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(["High Priority", "Medium Priority", "Normal"] as const).map((label, i) => {
                      const key = i === 0 ? "singleHighDuration" : i === 1 ? "singleMediumDuration" : "singleNormalDuration";
                      const color = i === 0 ? "text-rose-500" : i === 1 ? "text-amber-500" : "text-slate-400";
                      return (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key} className={cn("text-xs font-bold", color)}>{label}</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id={key}
                              type="number"
                              min="5"
                              max="300"
                              value={tvForm[key as keyof typeof tvForm] as number}
                              onChange={e => setTVForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                              className="h-9 text-sm"
                            />
                            <span className="text-xs text-muted-foreground shrink-0">sec</span>
                          </div>
                          {/* Quick-pick preset buttons */}
                          <div className="flex flex-wrap gap-1">
                            {[10, 20, 30, 60].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setTVForm(f => ({ ...f, [key]: p }))}
                                className={cn(
                                  "text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                  (tvForm[key as keyof typeof tvForm] as number) === p
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/40"
                                )}
                              >{p}s</button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Overview (multi) settings ───────────────────────────────── */}
              {(tvForm.displayMode === "multi" || tvForm.displayMode === "auto") && (
                <>
                  {(tvForm.displayMode === "auto") && <Separator />}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-purple-500" />
                      <h3 className="text-sm font-semibold">Overview Settings</h3>
                    </div>

                    {/* Notices per row */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Notices per row</Label>
                      <div className="flex gap-2">
                        {([2, 3] as const).map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setTVForm(f => ({ ...f, multiNoticesPerRow: n }))}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                              tvForm.multiNoticesPerRow === n
                                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                : "border-border text-muted-foreground hover:border-purple-500/40"
                            )}
                          >
                            <Layers className="h-3.5 w-3.5" />
                            {n} cards
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        How many notice cards appear side-by-side in the bottom grid
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Notice page duration */}
                      <div className="space-y-2">
                        <Label htmlFor="multiNoticePageDuration" className="text-xs font-bold text-purple-400">
                          Notice Page Duration
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="multiNoticePageDuration"
                            type="number" min="5" max="300"
                            value={tvForm.multiNoticePageDuration}
                            onChange={e => setTVForm(f => ({ ...f, multiNoticePageDuration: Number(e.target.value) }))}
                            className="h-9 text-sm"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">sec</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[10, 15, 20, 30].map(p => (
                            <button key={p} type="button"
                              onClick={() => setTVForm(f => ({ ...f, multiNoticePageDuration: p }))}
                              className={cn("text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                tvForm.multiNoticePageDuration === p
                                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                  : "border-border text-muted-foreground hover:border-purple-500/40"
                              )}>{p}s</button>
                          ))}
                        </div>
                      </div>

                      {/* High-priority hero duration */}
                      <div className="space-y-2">
                        <Label htmlFor="multiHighDuration" className="text-xs font-bold text-rose-400">
                          High-Priority Hero
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="multiHighDuration"
                            type="number" min="5" max="300"
                            value={tvForm.multiHighDuration}
                            onChange={e => setTVForm(f => ({ ...f, multiHighDuration: Number(e.target.value) }))}
                            className="h-9 text-sm"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">sec</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[15, 20, 30, 60].map(p => (
                            <button key={p} type="button"
                              onClick={() => setTVForm(f => ({ ...f, multiHighDuration: p }))}
                              className={cn("text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                tvForm.multiHighDuration === p
                                  ? "border-rose-500 bg-rose-500/10 text-rose-400"
                                  : "border-border text-muted-foreground hover:border-rose-500/40"
                              )}>{p}s</button>
                          ))}
                        </div>
                      </div>

                      {/* Achievement spotlight duration */}
                      <div className="space-y-2">
                        <Label htmlFor="multiAchievementDuration" className="text-xs font-bold text-yellow-400">
                          Achievement Spotlight
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="multiAchievementDuration"
                            type="number" min="5" max="300"
                            value={tvForm.multiAchievementDuration}
                            onChange={e => setTVForm(f => ({ ...f, multiAchievementDuration: Number(e.target.value) }))}
                            className="h-9 text-sm"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">sec</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[15, 20, 30, 60].map(p => (
                            <button key={p} type="button"
                              onClick={() => setTVForm(f => ({ ...f, multiAchievementDuration: p }))}
                              className={cn("text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                tvForm.multiAchievementDuration === p
                                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                                  : "border-border text-muted-foreground hover:border-yellow-500/40"
                              )}>{p}s</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Auto-switch settings ────────────────────────────────────── */}
              {tvForm.displayMode === "auto" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-semibold">Auto-Switch Schedule</h3>
                      <span className="text-xs text-muted-foreground ml-1">
                        — how long to show each mode before switching
                      </span>
                    </div>

                    {/* Start mode */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Start with</Label>
                      <div className="flex gap-2">
                        {(["single", "multi"] as const).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTVForm(f => ({ ...f, autoStartMode: m }))}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                              tvForm.autoStartMode === m
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                : "border-border text-muted-foreground hover:border-emerald-500/40"
                            )}
                          >
                            {m === "single" ? <MonitorPlay className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                            {m === "single" ? "Slideshow" : "Overview"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Single mode duration */}
                      <div className="space-y-2">
                        <Label htmlFor="autoSingleDuration" className="text-xs font-bold text-primary">
                          <MonitorPlay className="inline h-3.5 w-3.5 mr-1" />
                          Slideshow Duration
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="autoSingleDuration"
                            type="number" min="15" max="3600"
                            value={tvForm.autoSingleDuration}
                            onChange={e => setTVForm(f => ({ ...f, autoSingleDuration: Number(e.target.value) }))}
                            className="h-9 text-sm"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">sec</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[30, 60, 120, 180, 300].map(p => (
                            <button key={p} type="button"
                              onClick={() => setTVForm(f => ({ ...f, autoSingleDuration: p }))}
                              className={cn("text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                tvForm.autoSingleDuration === p
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              )}>
                              {p >= 60 ? `${p / 60}m` : `${p}s`}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Time in Slideshow before switching to Overview
                        </p>
                      </div>

                      {/* Multi mode duration */}
                      <div className="space-y-2">
                        <Label htmlFor="autoMultiDuration" className="text-xs font-bold text-purple-400">
                          <LayoutGrid className="inline h-3.5 w-3.5 mr-1" />
                          Overview Duration
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id="autoMultiDuration"
                            type="number" min="15" max="3600"
                            value={tvForm.autoMultiDuration}
                            onChange={e => setTVForm(f => ({ ...f, autoMultiDuration: Number(e.target.value) }))}
                            className="h-9 text-sm"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">sec</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[30, 60, 120, 180, 300].map(p => (
                            <button key={p} type="button"
                              onClick={() => setTVForm(f => ({ ...f, autoMultiDuration: p }))}
                              className={cn("text-[0.6rem] px-2 py-0.5 rounded-full border transition-colors",
                                tvForm.autoMultiDuration === p
                                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                  : "border-border text-muted-foreground hover:border-purple-500/40"
                              )}>
                              {p >= 60 ? `${p / 60}m` : `${p}s`}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Time in Overview before switching to Slideshow
                        </p>
                      </div>
                    </div>

                    {/* Summary pill */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        The TV will show <span className="font-bold text-primary">Slideshow</span> for{" "}
                        <span className="font-bold text-foreground">
                          {tvForm.autoSingleDuration >= 60 ? `${Math.round(tvForm.autoSingleDuration / 60)}m` : `${tvForm.autoSingleDuration}s`}
                        </span>
                        , then switch to <span className="font-bold text-purple-400">Overview</span> for{" "}
                        <span className="font-bold text-foreground">
                          {tvForm.autoMultiDuration >= 60 ? `${Math.round(tvForm.autoMultiDuration / 60)}m` : `${tvForm.autoMultiDuration}s`}
                        </span>
                        , then repeat.
                      </p>
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* TV Display Settings (general) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>General Display Settings</CardTitle>
              </div>
              <CardDescription>
                Dashboard defaults and refresh behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="space-y-2">
                  <Label>Default Category Filter</Label>
                  <Select
                    value={settings.defaultCategory}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, defaultCategory: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11">
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
