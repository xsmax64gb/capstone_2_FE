"use client";

import { Suspense } from "react";
import ExercisesContent from "@/components/exercises/exercises-content";

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
