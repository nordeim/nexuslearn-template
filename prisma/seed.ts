/**
 * NexusLearn seed — the exact 9-course catalog read off the live app
 * (titles, descriptions, categories, levels, ratings, student counts,
 * hours, lesson counts, instructors, prices and Unsplash imagery),
 * plus a demo login user.
 *
 *   bun run db:push && bun run db:seed
 *
 * Demo credentials (matches the reference app's demo account style):
 *   sepnetflix2023@outlook.com / $Abcd1234
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

import { resolveDatabaseUrl } from "./db-url";

const prisma = new PrismaClient({
  datasourceUrl: resolveDatabaseUrl(),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const COURSES = [
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
  },
];

const LESSON_TITLES = [
  "Getting Started & Course Overview",
  "Core Concepts & Fundamentals",
  "Hands-On Practice Session",
  "Real-World Project Walkthrough",
  "Advanced Techniques",
  "Best Practices & Patterns",
  "Common Pitfalls & Debugging",
  "Case Studies",
  "Capstone Project",
  "Next Steps & Resources",
];

async function main() {
  console.log("Seeding NexusLearn database…");

  // Courses + lessons
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { id: `seed-${c.sortOrder}` },
      update: { ...c, id: undefined as never },
      create: { id: `seed-${c.sortOrder}`, ...c },
    });
    // Replace lesson set each seed (idempotent)
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });
    const lessonCount = Math.min(c.lessonsCount, 12); // representative curriculum rows
    for (let i = 0; i < lessonCount; i++) {
      await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: LESSON_TITLES[i % LESSON_TITLES.length],
          duration: 8 + ((i * 7) % 35),
          sortOrder: i + 1,
        },
      });
    }
    console.log(`  ✓ ${c.title} (${lessonCount} lessons)`);
  }

  // Demo user (the reference app's demo account)
  await prisma.user.upsert({
    where: { email: "sepnetflix2023@outlook.com" },
    update: {},
    create: {
      email: "sepnetflix2023@outlook.com",
      name: "sepnetflix2023",
      passwordHash: hashPassword("$Abcd1234"),
    },
  });
  console.log("  ✓ demo user sepnetflix2023@outlook.com / $Abcd1234");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
