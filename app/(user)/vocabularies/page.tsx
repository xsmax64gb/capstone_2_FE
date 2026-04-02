"use client";

import { Suspense } from "react";
import VocabulariesContent from "@/components/vocabularies/vocabularies-content";

export default function VocabulariesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VocabulariesContent />
    </Suspense>
  );
}
