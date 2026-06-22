"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { Typography } from "@/components/typography";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/validations/product";

const UPLOAD_ROUTE = "/api/products/images/upload";
const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff";

type ProductImageUploaderProps = {
  remainingSlots: number;
  onUploaded: (url: string) => void;
};

// Uploads straight from the browser to Blob, then hands each URL back to the
// form. Files upload in parallel; anything past the remaining slots is dropped.
export const ProductImageUploader = ({
  remainingSlots,
  onUploaded,
}: ProductImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const disabled = remainingSlots <= 0;

  const uploadFiles = async (files: File[]) => {
    const withinSize = files.filter((file) => {
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over ${MAX_IMAGE_MB} MB`);
        return false;
      }
      return true;
    });

    const batch = withinSize.slice(0, remainingSlots);
    if (batch.length === 0) return;

    setPending((count) => count + batch.length);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const blob = await upload(`products/${file.name}`, file, {
            access: "public",
            handleUploadUrl: UPLOAD_ROUTE,
            contentType: file.type,
          });
          onUploaded(blob.url);
        } catch {
          toast.error(`Could not upload ${file.name}`);
        } finally {
          setPending((count) => count - 1);
        }
      }),
    );
  };

  const onSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    void uploadFiles(files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    void uploadFiles(files);
  };

  const label = disabled
    ? "Maximum images reached"
    : pending > 0
      ? `Uploading ${pending}…`
      : "Click or drag images here to upload";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={onSelect}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-input",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {pending > 0 ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="size-5 text-muted-foreground" />
        )}
        <Typography variant="muted" className="text-sm">
          {label}
        </Typography>
      </button>
    </>
  );
};
