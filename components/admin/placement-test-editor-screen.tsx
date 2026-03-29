"use client";

import { PlacementTestEditorScreenInner } from "./placement-test-editor-screen-inner";

type Props = {
  testId?: string;
};

export function PlacementTestEditorScreen({ testId }: Props) {
  return <PlacementTestEditorScreenInner testId={testId} />;
}
