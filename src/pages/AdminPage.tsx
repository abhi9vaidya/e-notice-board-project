import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
} from 'lucide-react';
import { FirestoreProfile } from '@/integrations/firebase/types';
import { toTitleCase } from '@/lib/utils';

interface FacultyRecord extends FirestoreProfile {
  uid: string;
}

const STEPS = [
  {
    num: 1,
    title: 'Faculty submits a request',
    body: 'Faculty clicks "Request Access" on the login page, fills in their name, department, email, and sets their own password. Their account is created but marked pending - they cannot log in yet.',
  },
  {
    num: 2,
    title: 'You review the request here',
    body: "Pending requests appear at the top of this page with the faculty's name, email, and department. Click Approve to grant access or Reject to deny it.",
  },
  {
    num: 3,
    title: 'Faculty gets access immediately',
    body: 'Once approved, the faculty member can sign in with the email and password they already set. No Firebase console work needed.',
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const setStatus = async (uid: string, status: 'approved' | 'rejected') => {
    setActionLoading(uid + status);
    await updateDoc(doc(db, 'profiles', uid), { status, updatedAt: serverTimestamp() });
    setRecords(prev => prev.map(r => r.uid === uid ? { ...r, status } : r));
    setActionLoading(null);
  };

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

  const pending  = records.filter(r => r.status === 'pending');
  const rejected = records.filter(r => r.status === 'rejected');
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
      <div className="container max-w-4xl px-4 py-8 space-y-6">

        {/* Pending Requests */}
        <Card className={`border-0 shadow-lg ${pending.length > 0 ? 'ring-2 ring-amber-400/60' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Requests
                  {pending.length > 0 && (
                    <Badge className="ml-1 bg-amber-500 text-white">{pending.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Faculty waiting for your approval</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProfiles} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : pending.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                No pending requests - you are all caught up!
              </p>
            ) : (
              pending.map(r => (
                <div key={r.uid}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={r.profilePhotoUrl} alt={r.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold text-sm dark:bg-amber-900/40 dark:text-amber-300">
                      {getInitials(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-foreground">{toTitleCase(r.name)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0" />{r.email}
                    </p>
                    {r.department && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 shrink-0" />{r.department}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                      disabled={actionLoading === r.uid + 'approved'}
                      onClick={() => setStatus(r.uid, 'approved')}>
                      {actionLoading === r.uid + 'approved'
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Approve
                    </Button>
                    <Button size="sm" variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10 gap-1.5"
                      disabled={actionLoading === r.uid + 'rejected'}
                      onClick={() => setStatus(r.uid, 'rejected')}>
                      {actionLoading === r.uid + 'rejected'
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <XCircle className="h-3.5 w-3.5" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ))
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
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Loading...
              </div>
            ) : filteredApproved.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No approved accounts found.</p>
            ) : (
              filteredApproved.map(r => (
                <div key={r.uid}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={r.profilePhotoUrl} alt={r.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getInitials(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{toTitleCase(r.name)}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                    {r.department && (
                      <p className="text-xs text-muted-foreground truncate">{r.department}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={r.role === 'admin' ? 'default' : 'secondary'} className="gap-1 text-xs">
                      {r.role === 'admin'
                        ? <><ShieldCheck className="h-3 w-3" />Admin</>
                        : <><UserCircle className="h-3 w-3" />Faculty</>}
                    </Badge>
                    {r.uid !== faculty.id && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                          onClick={() => toggleRole(r.uid, r.role)}>
                          {r.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
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
          </CardContent>
        </Card>

        {/* Rejected (dimmed, only shown if any exist) */}
        {rejected.length > 0 && (
          <Card className="border-0 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejected Requests
                <Badge variant="secondary" className="ml-1">{rejected.length}</Badge>
              </CardTitle>
              <CardDescription>These accounts were denied access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rejected.map(r => (
                <div key={r.uid}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">{toTitleCase(r.name)}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1"
                      onClick={() => setStatus(r.uid, 'approved')}>
                      <CheckCircle2 className="h-3 w-3" />Re-approve
                    </Button>
                    <Button size="icon" variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeProfile(r.uid)} title="Remove profile">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminPage;
