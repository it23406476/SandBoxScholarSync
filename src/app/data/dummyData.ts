import {
  MessageSquare,
  Award,
  Users,
  BookOpen,
  Zap,
  Shield,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react';

export const features = [
  {
    icon: MessageSquare,
    title: 'Module-Based Q&A',
    desc: 'Ask and answer questions organized by academic modules with threaded discussions.',
    color: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: Award,
    title: 'Reputation & Badges',
    desc: 'Earn recognition for your contributions and climb the leaderboard.',
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500',
  },
  {
    icon: Users,
    title: 'Lecturer Verification',
    desc: 'Get verified, authoritative answers directly from your lecturers.',
    color: 'from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Sharing',
    desc: 'Share resources, notes, tips, and study materials with your peers.',
    color: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: Zap,
    title: 'Smart Suggestions',
    desc: 'AI-powered duplicate detection and similar question recommendations.',
    color: 'from-cyan-500/20 to-sky-500/20',
    iconColor: 'text-cyan-500',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Tailored dashboards and permissions for students and lecturers.',
    color: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-500',
  },
];

export const steps = [
  {
    num: '01',
    title: 'Create Your Account',
    desc: 'Sign up with your university email and pick your modules.',
    icon: GraduationCap,
  },
  {
    num: '02',
    title: 'Ask or Browse Questions',
    desc: 'Post questions or explore answers organized by module and topic.',
    icon: Search,
  },
  {
    num: '03',
    title: 'Learn & Earn Reputation',
    desc: 'Answer questions, get upvoted, and earn badges as you help others.',
    icon: Sparkles,
  },
];

export const testimonials = [
  {
    quote:
      'ScholarSync completely changed how I study. Finding verified answers in seconds saves me hours every week.',
    name: 'Kavisha Perera',
    role: 'BSc IT Student',
    avatar: 'KP',
  },
  {
    quote:
      'As a lecturer, I love that students can self-organize and I can verify the best answers. It reduces my email load by 80%.',
    name: 'Dr. Nimal Silva',
    role: 'Senior Lecturer',
    avatar: 'NS',
  },
  {
    quote:
      "The reputation system keeps everyone motivated. I've earned 5 badges this semester and it's genuinely fun!",
    name: 'Amaya Fernando',
    role: 'BSc CS Student',
    avatar: 'AF',
  },
];

export const stats = [
  { value: '5,000+', label: 'Active Students' },
  { value: '200+', label: 'Lecturers' },
  { value: '15,000+', label: 'Questions Answered' },
  { value: '50+', label: 'Modules Covered' },
];

export const moduleList = [
  'IT3040 - Software Engineering',
  'CS2023 - Data Structures',
  'IT4010 - Machine Learning',
  'CS3060 - Database Systems',
  'IT2050 - Web Technologies',
  'CS4080 - Cloud Computing',
  'IT3070 - Networking',
  'CS2040 - OOP Concepts',
];
