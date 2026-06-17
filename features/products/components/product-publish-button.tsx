"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type ProductSummary } from "@/features/products/services/product-service";

type ProductPublishButtonProps = {
  product: ProductSummary;
  onPublish: (product: ProductSummary) => void;
};

// stopPropagation so clicking Publish doesn't also fire the row-click
// navigation.
export const ProductPublishButton = ({
  product,
  onPublish,
}: ProductPublishButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={(event) => {
      event.stopPropagation();
      onPublish(product);
    }}
  >
    <Upload />
    Publish
  </Button>
);
