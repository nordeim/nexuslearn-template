"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, CheckCircle2 } from "lucide-react";

const CARD_BUTTON =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-6 rounded-xl text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02]";

export function EnrollButton({
  courseId,
  isLoggedIn,
  alreadyEnrolled,
}: {
  courseId: string;
  isLoggedIn: boolean;
  alreadyEnrolled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(alreadyEnrolled);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setEnrolled(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          You&apos;re enrolled!
        </div>
        <Link href="/Dashboard">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Continue Learning
          </button>
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className={`${CARD_BUTTON} disabled:pointer-events-none disabled:opacity-60`}
    >
      {loading ? "Enrolling…" : "Enroll Now"}
    </button>
  );
}
