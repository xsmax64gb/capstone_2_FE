"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteConfirmButtonProps = {
  itemLabel: string;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
};

export function DeleteConfirmButton({
  itemLabel,
  title = "Xác nhận xóa",
  description,
  onConfirm,
  disabled = false,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded-3xl border-slate-200 p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="leading-7">
            {description || `Bạn có chắc muốn xóa "${itemLabel}"? Hành động này không thể hoàn tác.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
          >
            {isSubmitting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
