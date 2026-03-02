import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Search,
  ShieldCheck,
  UserCircle,
  Trash2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  ListChecks,
  PlusCircle,
  UserCheck,
} from 'lucide-react';
import { FirestoreProfile } from '@/integrations/firebase/types';
import { toTitleCase } from '@/lib/utils';

interface FacultyRecord extends FirestoreProfile {
  uid: string;
}

interface AllowlistEntry {
  email: string;
  department?: string;
  addedAt?: { toDate(): Date };
  hasProfile?: boolean; // true if this person has already signed up
}

const STEPS = [
  {
    num: 1,
    title: 'Admin adds faculty email to the allowlist',
    body: 'Use the "Faculty Allowlist" card below to add a faculty email address. Optionally set their department. Only these emails can sign in.',
  },
  {
    num: 2,
    title: 'Faculty signs in with Google',
    body: 'The faculty member opens the app and clicks "Sign in with Google" using their institutional account. If their email is on the allowlist, they proceed.',
  },
  {
    num: 3,
    title: 'First sign-in: confirm department',
    body: 'On their first sign-in they select their department (pre-filled if you set it in the allowlist). Their profile is created and approved instantly.',
  },
  {
    num: 4,
    title: 'Promote to admin (optional)',
    body: 'Use the "Make Admin" button in the Faculty Accounts list to grant admin privileges to any approved faculty member.',
  },
];

const AdminPage: React.FC = () => {
  const { faculty, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<FacultyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Allowlist state
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>([]);
  const [allowlistLoading, setAllowlistLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [addEmailError, setAddEmailError] = useState('');

  useEffect(() => {
    if (!authLoading && faculty && faculty.role !== 'admin') navigate('/');
  }, [faculty, authLoading, navigate]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      const data: FacultyRecord[] = snap.docs.map(d => ({
        uid: d.id,
        ...(d.data() as FirestoreProfile),
      }));
      setRecords(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllowlist = useCallback(async () => {
    setAllowlistLoading(true);
    try {
      const [snap, profileSnap] = await Promise.all([
        getDocs(collection(db, 'allowlist')),
        getDocs(collection(db, 'profiles')),
      ]);
      const profileEmails = new Set(
        profileSnap.docs.map(d => (d.data() as FirestoreProfile).email?.toLowerCase())
      );
      const data: AllowlistEntry[] = snap.docs.map(d => ({
        email: d.id,
        ...(d.data() as Omit<AllowlistEntry, 'email'>),
        hasProfile: profileEmails.has(d.id),
      }));
      data.sort((a, b) => a.email.localeCompare(b.email));
      setAllowlist(data);
    } catch (err) {
      console.error('Failed to load allowlist:', err);
    } finally {
      setAllowlistLoading(false);
    }
  }, []);

  const addToAllowlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddEmailError('');
    const emailNorm = newEmail.trim().toLowerCase();
    if (!emailNorm.endsWith('@rknec.edu') && !emailNorm.endsWith('@rbunagpur.in')) {
      setAddEmailError('Email must end with @rknec.edu or @rbunagpur.in.');
      return;
    }
    setAddingEmail(true);
    try {
      await setDoc(doc(db, 'allowlist', emailNorm), {
        department: newDept.trim() || null,
        addedAt: serverTimestamp(),
      });
      setNewEmail('');
      setNewDept('');
      await fetchAllowlist();
    } catch (err) {
      console.error('Failed to add to allowlist:', err);
      setAddEmailError('Failed to add email. Please try again.');
    } finally {
      setAddingEmail(false);
    }
  };

  const removeFromAllowlist = async (email: string) => {
    if (!window.confirm(`Remove ${email} from the allowlist? They will not be able to sign in again until re-added.`)) return;
    await deleteDoc(doc(db, 'allowlist', email));
    setAllowlist(prev => prev.filter(e => e.email !== email));
  };

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);
  useEffect(() => { fetchAllowlist(); }, [fetchAllowlist]);

  const toggleRole = async (uid: string, current: 'faculty' | 'admin') => {
    const newRole = current === 'admin' ? 'faculty' : 'admin';
    await updateDoc(doc(db, 'profiles', uid), { role: newRole, updatedAt: serverTimestamp() });
    setRecords(prev => prev.map(r => r.uid === uid ? { ...r, role: newRole } : r));
  };

  const removeProfile = async (uid: string) => {
    if (!window.confirm('Remove this profile? The Firebase Auth account must be deleted separately in the Firebase console.')) return;
    await deleteDoc(doc(db, 'profiles', uid));
    setRecords(prev => prev.filter(r => r.uid !== uid));
  };

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const approved = records.filter(r => !r.status || r.status === 'approved');

  const filteredApproved = approved.filter(r => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.department ?? '').toLowerCase().includes(q)
    );
  });

  const filteredAdmins  = filteredApproved.filter(r => r.role === 'admin');
  const filteredFaculty = filteredApproved.filter(r => r.role !== 'admin');

  if (authLoading) {
    return (
      <AdminLayout title="Admin" subtitle="">
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mr-3" />
          Loading...
        </div>
      </AdminLayout>
    );
  }

  if (!faculty || faculty.role !== 'admin') {
    return (
      <AdminLayout title="Admin" subtitle="">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <ShieldCheck className="h-10 w-10 opacity-40" />
          <p className="font-medium">Admin access required.</p>
          <p className="text-sm">Ask an existing admin to promote your account.</p>
          <Button variant="outline" onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin" subtitle="Manage faculty accounts and access requests">
      <div className="container max-w-5xl px-4 py-8 space-y-6">

        {/* ── Faculty Allowlist ───────────────────────────────────────────── */}
        <Card className="border-0 shadow-lg ring-2 ring-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Faculty Allowlist
                  {!allowlistLoading && (
                    <Badge variant="secondary" className="ml-1">{allowlist.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Only emails on this list can sign in. Add faculty emails here before they
                  attempt to log in — students are blocked automatically.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAllowlist} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${allowlistLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add email form */}
            <form onSubmit={addToAllowlist} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="faculty@rknec.edu or faculty@rbunagpur.in"
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setAddEmailError(''); }}
                  className="h-9"
                  required
                />
              </div>
              <div className="w-full sm:w-52">
                <Input
                  type="text"
                  placeholder="Department (optional)"
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0" disabled={addingEmail || !newEmail.trim()}>
                {addingEmail
                  ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  : <PlusCircle className="h-3.5 w-3.5" />}
                Add
              </Button>
            </form>
            {addEmailError && <p className="text-sm text-destructive">{addEmailError}</p>}

            {/* List */}
            {allowlistLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />Loading...
              </div>
            ) : allowlist.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                No emails added yet. Add faculty emails above to grant sign-in access.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {allowlist.map(entry => (
                  <div key={entry.email}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">{entry.email}</span>
                        {entry.hasProfile && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1 shrink-0">
                            <UserCheck className="h-2.5 w-2.5" />Signed up
                          </Badge>
                        )}
                      </div>
                      {entry.department && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3" />{entry.department}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => removeFromAllowlist(entry.email)}
                      title="Remove from allowlist">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* How it works (collapsible) */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="cursor-pointer select-none" onClick={() => setShowGuide(v => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                How the access request flow works
              </CardTitle>
              {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <CardDescription>No Firebase console work needed for new faculty</CardDescription>
          </CardHeader>
          {showGuide && (
            <CardContent className="space-y-4 pt-0">
              {STEPS.map(step => (
                <div key={step.num} className="flex gap-4">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-medium text-foreground leading-snug">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.body}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Deleting a profile here removes dashboard access but the
                Firebase Auth account still exists. To fully remove a user, delete them in
                Firebase console &rarr; Authentication &rarr; Users.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Approved Faculty */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Faculty Accounts
                  {!loading && (
                    <Badge variant="secondary" className="ml-1">{approved.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Approved accounts with active access</CardDescription>
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email or department..."
                value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Loading...
              </div>
            ) : filteredApproved.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No approved accounts found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admins column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Admins</span>
                    <Badge variant="default" className="ml-auto text-xs">{filteredAdmins.length}</Badge>
                  </div>
                  {filteredAdmins.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No admins match your search.</p>
                  ) : (
                    filteredAdmins.map(r => (
                      <div key={r.uid}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-primary/5 hover:bg-primary/10 transition-colors">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={r.profilePhotoUrl} alt={r.name} />
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                            {getInitials(r.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{toTitleCase(r.name)}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                          {r.department && (
                            <p className="text-xs text-muted-foreground truncate">{r.department}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.uid !== faculty.id && (
                            <>
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                                onClick={() => toggleRole(r.uid, r.role)}>
                                Revoke Admin
                              </Button>
                              <Button size="icon" variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => removeProfile(r.uid)} title="Remove profile">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Faculty column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Faculty</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{filteredFaculty.length}</Badge>
                  </div>
                  {filteredFaculty.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No faculty match your search.</p>
                  ) : (
                    filteredFaculty.map(r => (
                      <div key={r.uid}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={r.profilePhotoUrl} alt={r.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {getInitials(r.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{toTitleCase(r.name)}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                          {r.department && (
                            <p className="text-xs text-muted-foreground truncate">{r.department}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                            onClick={() => toggleRole(r.uid, r.role)}>
                            Make Admin
                          </Button>
                          <Button size="icon" variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => removeProfile(r.uid)} title="Remove profile">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </AdminLayout>
  );
};

export default AdminPage;

