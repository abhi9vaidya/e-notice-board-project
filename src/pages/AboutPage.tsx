import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Users,
  FileText,
  Tv,
  Shield,
  Target,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Code2,
  GraduationCap,
  BookOpen,
  User,
} from "lucide-react";
import rbuLogo from "@/assets/rbu-logo.png";

const teamMembers = [
  { roll: "03", name: "Abhinav Vaidya" },
  { roll: "20", name: "Kartik Suchak" },
  { roll: "71", name: "Mansi Motghare", leader: true },
  { roll: "72", name: "Parnavi Kite" },
];

const techStack = [
  { label: "Frontend", value: "React.js (TypeScript), Tailwind CSS, shadcn/ui" },
  { label: "Backend / Database", value: "Firebase Firestore (Cloud NoSQL)" },
  { label: "Authentication", value: "Firebase Authentication" },
  { label: "File Storage", value: "Google Drive API (Apps Script Bridge)" },
  { label: "Hosting", value: "Firebase Hosting" },
  { label: "Dev Tools", value: "VS Code, Vite, Git" },
];

const categories = [
  { label: "Academic", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Examinations", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { label: "Placements", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { label: "Events", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { label: "Announcements", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "Achievements", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { label: "Other", color: "bg-secondary/80 text-secondary-foreground" },
];

const AboutPage: React.FC = () => {
  return (
    <AdminLayout
      title="About / Help"
      subtitle="E-Notice Board System for Automated Institutional Communication"
    >
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        <div className="grid gap-6">

          {/* Header Card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-primary/90 to-primary/80" />
            <CardHeader className="-mt-10">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-lg p-2">
                  <img src={rbuLogo} alt="RBU Logo" className="h-16 w-16 object-contain" />
                </div>
                <div>
                  <CardTitle className="text-2xl">RBU E-Notice Board System</CardTitle>
                  <CardDescription className="text-base">
                    E-Notice Board System for Automated Institutional Communication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                A centralized, web-based digital notice management system developed for
                Ramdeobaba University, Nagpur. It replaces traditional paper-based notice
                boards with a secure faculty dashboard, time-based notice scheduling, and
                an always-on smart TV display that automatically rotates active notices in
                real time.
              </p>
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Team */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Group 11 — Team Members</CardTitle>
                </div>
                <CardDescription>B.Tech Semester VI Project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {teamMembers.map((m) => (
                  <div key={m.roll} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {m.name}
                        {m.leader && (
                          <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-primary/15 text-primary border border-primary/20">
                            Team Leader
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Roll No. {m.roll}</p>
                    </div>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dr. Poorva S. Sabnis</p>
                    <p className="text-xs text-muted-foreground">Project Guide</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Technology Stack</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {techStack.map((t) => (
                  <div key={t.label}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.label}</p>
                    <p className="text-sm text-foreground">{t.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Project Objectives</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Centralized web-based digital notice board system",
                  "Secure multi-faculty dashboard with role-based access",
                  "Category-based notice organization",
                  "Time-based notice visibility with automatic expiry",
                  "Automated display on smart TV without manual intervention",
                  "Permanent database for current and archived notices",
                  "Google Drive integration for file storage",
                  "Scalable architecture for future mobile app extension",
                ].map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Faculty Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• Create, edit, and delete notices</li>
                  <li>• Upload images and PDF documents</li>
                  <li>• Set start/end dates for automatic expiry</li>
                  <li>• Assign categories and priorities</li>
                  <li>• Admin approval workflow for new faculty</li>
                  <li>• Archive of expired notices</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">TV Display Mode</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>• Full-screen auto-rotating slideshow</li>
                  <li>• Priority-based slide duration</li>
                  <li>• Live clock and date</li>
                  <li>• Upcoming events sidebar</li>
                  <li>• Student achievements spotlight</li>
                  <li>• Auto-reconnects after TV power cycle</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Notice Categories</CardTitle>
              </div>
              <CardDescription>All notices are organized into these categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge key={c.label} className={c.color}>{c.label}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Institution</CardTitle>
              </div>
              <CardDescription>Ramdeobaba University, Nagpur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-xs text-muted-foreground">Nagpur, Maharashtra</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">info@rbu.edu.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-xs text-muted-foreground">+91 712 258 0011</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-3">Group 11 · B.Tech Semester VI · 2025–26</Badge>
                <p className="text-sm text-muted-foreground">
                  Developed as part of the academic curriculum at Ramdeobaba University
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Guide: Dr. Poorva S. Sabnis
                </p>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">
                  © 2026 Ramdeobaba University. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AboutPage;

