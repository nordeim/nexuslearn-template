/**
 * NexusLearn seed data — the exact 9-course catalog read off the reference
 * app (titles, descriptions, categories, levels, ratings, student counts,
 * hours, lesson counts, instructors, prices, Unsplash imagery and the
 * "What You'll Learn" tag lists), kept as a pure module so the test suite
 * can pin its shape (tests/seed-data.test.ts).
 *
 * The reference app's curriculum model auto-generates `lessonsCount` lessons
 * per course, each titled "Lesson N: Module Content" — buildLessons()
 * reproduces that exactly.
 */

export interface SeedCourse {
  title: string;
  description: string;
  category: string;
  level: string;
  rating: number;
  students: number;
  hours: number;
  lessonsCount: number;
  instructorName: string;
  instructorAvatar: string;
  image: string;
  price: number;
  originalPrice: number;
  featured: boolean;
  sortOrder: number;
  tags: string;
}

export const COURSES: SeedCourse[] = [
  {
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and cloud architecture from beginner to certified professional.",
    category: "Technology",
    level: "Intermediate",
    rating: 4.7,
    students: 5670,
    hours: 40,
    lessonsCount: 220,
    instructorName: "David Wright",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    price: 69.99,
    originalPrice: 179.99,
    featured: false,
    sortOrder: 1,
    tags: "AWS, Cloud, DevOps, Serverless, Microservices",
  },
  {
    title: "Advanced Python Programming",
    description: "Take your Python skills to the next level with advanced concepts, design patterns, and real applications.",
    category: "Programming",
    level: "Advanced",
    rating: 4.8,
    students: 3890,
    hours: 35,
    lessonsCount: 180,
    instructorName: "Dr. Sarah Mitchell",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1fd?w=100&q=80",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80",
    price: 54.99,
    originalPrice: 139.99,
    featured: true,
    sortOrder: 2,
    tags: "Python, Design Patterns, APIs, Testing, Performance",
  },
  {
    title: "Machine Learning & AI Masterclass",
    description: "Master machine learning algorithms, deep learning, and AI with Python and TensorFlow.",
    category: "AI & Innovation",
    level: "Intermediate",
    rating: 4.8,
    students: 8320,
    hours: 48,
    lessonsCount: 250,
    instructorName: "Prof. James Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80",
    price: 79.99,
    originalPrice: 199.99,
    featured: true,
    sortOrder: 3,
    tags: "Python, TensorFlow, Neural Networks, Deep Learning, NLP",
  },
  {
    title: "Complete Web Development Bootcamp 2026",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer.",
    category: "Programming",
    level: "Beginner",
    rating: 4.9,
    students: 12450,
    hours: 62,
    lessonsCount: 375,
    instructorName: "Dr. Sarah Mitchell",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1fd?w=100&q=80",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
    price: 49.99,
    originalPrice: 149.99,
    featured: true,
    sortOrder: 4,
    tags: "HTML, CSS, JavaScript, React, Node.js, MongoDB",
  },
  {
    title: "UI/UX Design Professional Certificate",
    description: "Learn user interface and experience design from scratch with Figma and real-world projects.",
    category: "Design",
    level: "Beginner",
    rating: 4.9,
    students: 5430,
    hours: 42,
    lessonsCount: 210,
    instructorName: "Alex Kim",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    price: 59.99,
    originalPrice: 129.99,
    featured: true,
    sortOrder: 5,
    tags: "Figma, User Research, Wireframing, Prototyping, Design Systems",
  },
  {
    title: "Digital Marketing Strategy A-Z",
    description: "Complete guide to SEO, social media marketing, email campaigns, and paid advertising.",
    category: "Marketing",
    level: "Beginner",
    rating: 4.7,
    students: 6750,
    hours: 36,
    lessonsCount: 190,
    instructorName: "Emma Rodriguez",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    price: 39.99,
    originalPrice: 99.99,
    featured: true,
    sortOrder: 6,
    tags: "SEO, Social Media, Google Ads, Email Marketing, Analytics",
  },
  {
    title: "Data Science with Python & SQL",
    description: "Learn data analysis, visualization, and SQL querying to become a data-driven professional.",
    category: "Technology",
    level: "Beginner",
    rating: 4.8,
    students: 6120,
    hours: 44,
    lessonsCount: 230,
    instructorName: "Prof. James Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    price: 59.99,
    originalPrice: 149.99,
    featured: false,
    sortOrder: 7,
    tags: "Python, SQL, Pandas, Matplotlib, Data Visualization",
  },
  {
    title: "Business Strategy & Leadership",
    description: "Develop essential business acumen, strategic thinking, and leadership skills for the modern workplace.",
    category: "Business",
    level: "Intermediate",
    rating: 4.6,
    students: 4210,
    hours: 28,
    lessonsCount: 150,
    instructorName: "Michael Park",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    price: 44.99,
    originalPrice: 119.99,
    featured: true,
    sortOrder: 8,
    tags: "Leadership, Strategy, Management, Decision Making",
  },
  {
    title: "Emotional Intelligence & Mindfulness",
    description: "Develop your emotional intelligence, build resilience, and master mindfulness practices for personal growth.",
    category: "Personal Development",
    level: "Beginner",
    rating: 4.9,
    students: 7230,
    hours: 18,
    lessonsCount: 95,
    instructorName: "Dr. Lisa Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80",
    price: 29.99,
    originalPrice: 79.99,
    featured: false,
    sortOrder: 9,
    tags: "Mindfulness, EQ, Stress Management, Meditation",
  },
];

/**
 * The reference app's curriculum generator: every course lists exactly
 * `lessonsCount` lessons titled "Lesson N: Module Content" (no durations).
 */
export function buildLessons(lessonsCount: number): { title: string; sortOrder: number }[] {
  return Array.from({ length: lessonsCount }, (_, i) => ({
    title: `Lesson ${i + 1}: Module Content`,
    sortOrder: i + 1,
  }));
}
