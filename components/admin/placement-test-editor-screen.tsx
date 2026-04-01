"use client";

import { PlacementTestEditorScreenInner } from "./placement-test-editor-screen-inner";

type Props = {
  testId?: string;
  source?: string;
};

export function PlacementTestEditorScreen({ testId, source }: Props) {
  return <PlacementTestEditorScreenInner testId={testId} source={source} />;
}
