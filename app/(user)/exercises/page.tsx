"use client";

import { Suspense } from "react";
import ExercisesContent from "./content";

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
