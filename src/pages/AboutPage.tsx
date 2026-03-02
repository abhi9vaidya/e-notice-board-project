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
  MapPin
} from "lucide-react";
import rbuLogo from "@/assets/rbu-logo.png";

const AboutPage: React.FC = () => {
  return (
    <AdminLayout
      title="About / Help"
      subtitle="Learn about the E-Notice Board System"
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
                    Ramdeobaba University, Nagpur
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                The Smart E-Notice Board System is a modern digital solution designed for 
                Ramdeobaba University to streamline the communication of important notices, 
                announcements, and updates to students, faculty, and staff. This system 
                replaces traditional paper-based notice boards with an efficient, 
                eco-friendly, and easily accessible digital platform.
              </p>
            </CardContent>
          </Card>

          {/* Purpose & Objectives */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Purpose & Objectives</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Centralized notice management for all departments",
                  "Real-time updates visible across campus displays",
                  "Category-based organization for easy navigation",
                  "Priority-based notice highlighting for urgent matters",
                  "Eco-friendly alternative to paper notices",
                  "24/7 accessibility for students and faculty",
                  "Archive system for historical records",
                  "Multi-platform support (Web, TV, Mobile)",
                ].map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Admin Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Admin Panel</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Create, edit, and delete notices</li>
                  <li>• Manage notice categories and priorities</li>
                  <li>• Set notice visibility duration</li>
                  <li>• Upload attachments (PDF, Images)</li>
                  <li>• Configure display settings</li>
                </ul>
              </CardContent>
            </Card>

            {/* TV Display */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">TV Display Mode</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Full-screen slideshow presentation</li>
                  <li>• Auto-rotating notice display</li>
                  <li>• Spiritual quotes integration</li>
                  <li>• Priority-based highlighting</li>
                  <li>• Real-time clock display</li>
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
              <CardDescription>
                Notices are organized into the following categories:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border border-primary/20">Placement</Badge>
                <Badge className="bg-secondary/80 text-secondary-foreground">Academic</Badge>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Exams</Badge>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Timetable</Badge>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Research</Badge>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Alumni</Badge>
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Spiritual</Badge>
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Achievements</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Contact Information</CardTitle>
              </div>
              <CardDescription>
                Ramdeobaba University (RCOEM), Nagpur
              </CardDescription>
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

          {/* Project Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-3">B.Tech Semester Project</Badge>
                <p className="text-sm text-muted-foreground">
                  Developed as part of the academic curriculum at Ramdeobaba University
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
