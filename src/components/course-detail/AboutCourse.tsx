"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * "About This Course" — the reference app's expandable description block on
 * the course detail body. The long text is clamped to 6 lines and a
 * "Read More" / "Show Less" toggle removes the clamp (classes captured from
 * the reference DOM).
 */
export function AboutCourse({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
      <p className={`text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-6"}`}>
        {description}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-purple-600 font-medium text-sm flex items-center gap-1 hover:text-purple-700"
      >
        {expanded ? "Show Less" : "Read More"}
        {expanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
