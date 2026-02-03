import { Notice } from '@/types/notice';

// Helper to create dates relative to now
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

// Mock notices for demonstration
// TODO: Replace with Firebase Firestore collection when integrating backend
export const mockNotices: Notice[] = [
  {
    id: '1',
    title: 'Campus Placement Drive - TCS',
    description: 'TCS is conducting an on-campus recruitment drive for B.Tech and M.Tech students. Eligible candidates must have 60% or above in all semesters. Bring your resume and college ID.',
    category: 'placement',
    priority: 'high',
    template: 'urgent',
    facultyName: 'Dr. Rajesh Kumar',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop',
    startTime: hoursAgo(2),
    endTime: hoursFromNow(48),
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(2),
  },
  {
    id: '2',
    title: 'Mid-Semester Examination Schedule',
    description: 'The mid-semester examinations for all undergraduate courses will commence from next Monday. Students are advised to collect their hall tickets from the examination cell.',
    category: 'academic',
    priority: 'high',
    template: 'standard',
    facultyName: 'Prof. Anita Sharma',
    startTime: hoursAgo(4),
    endTime: hoursFromNow(168),
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(4),
  },
  {
    id: '3',
    title: 'Final Year Project Submission Deadline',
    description: 'All final year students are reminded that the project report submission deadline is approaching. Submit your reports to the department office along with the plagiarism certificate.',
    category: 'project',
    priority: 'medium',
    template: 'featured',
    facultyName: 'Dr. Priya Verma',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop',
    startTime: hoursAgo(1),
    endTime: hoursFromNow(72),
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(1),
  },
  {
    id: '4',
    title: 'Morning Prayer Assembly',
    description: 'Daily morning prayer assembly will be held at the college auditorium. All students and faculty members are requested to attend and participate in this spiritual gathering.',
    category: 'spiritual',
    priority: 'low',
    template: 'minimal',
    facultyName: 'Father Thomas',
    startTime: hoursAgo(10),
    endTime: hoursFromNow(24),
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(10),
  },
  {
    id: '5',
    title: 'Infosys Pool Campus Drive',
    description: 'Infosys is visiting for pool campus recruitment. Students from CSE, IT, and ECE with 65% aggregate are eligible. Online test followed by HR interview.',
    category: 'placement',
    priority: 'high',
    template: 'urgent',
    facultyName: 'Dr. Rajesh Kumar',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
    startTime: hoursAgo(3),
    endTime: hoursFromNow(96),
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(3),
  },
  {
    id: '6',
    title: 'Workshop on Machine Learning',
    description: 'A two-day workshop on Machine Learning and AI will be conducted by industry experts. Registration is mandatory. Limited seats available on first-come-first-serve basis.',
    category: 'academic',
    priority: 'medium',
    template: 'standard',
    facultyName: 'Prof. Suresh Nair',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
    startTime: hoursAgo(6),
    endTime: hoursFromNow(120),
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(6),
  },
];

// Default faculty for mock authentication
export const mockFaculty = {
  id: 'faculty-1',
  name: 'Dr. Rajesh Kumar',
  department: 'Computer Science',
};

// Common department password for demo
export const DEPARTMENT_PASSWORD = 'faculty123';
