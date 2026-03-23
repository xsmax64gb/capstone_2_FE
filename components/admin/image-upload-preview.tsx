"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";

type ImageUploadPreviewProps = {
  file: File | null;
  currentUrl?: string;
  emptyText?: string;
  alt: string;
  ratio?: number;
  className?: string;
};

export function ImageUploadPreview({
  file,
  currentUrl = "",
  emptyText = "Chưa có ảnh được chọn.",
  alt,
  ratio = 16 / 9,
  className = "",
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const imageSrc = previewUrl || currentUrl;

  return (
    <Card className={`overflow-hidden border-dashed border-slate-200 bg-slate-50/70 ${className}`}>
      <CardContent className="p-2">
        {imageSrc ? (
          <AspectRatio ratio={ratio} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <img
              src={imageSrc}
              alt={alt}
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        ) : (
          <AspectRatio
            ratio={ratio}
            className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white"
          >
            <div className="flex flex-col items-center gap-1.5 px-3 py-2 text-center text-slate-500">
              <ImageIcon className="h-4 w-4" />
              <p className="text-[11px] leading-4">{emptyText}</p>
            </div>
          </AspectRatio>
        )}
      </CardContent>
    </Card>
  );
}
