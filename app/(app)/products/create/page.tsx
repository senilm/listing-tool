import { CopyPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/features/products/components/product-form";
import { getProduct } from "@/features/products/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { productCreateRoute } from "@/lib/routes";
import {
  toProductFormValues,
  type ProductFormValues,
} from "@/validations/product";

type CreateProductPageProps = {
  searchParams: Promise<{ from?: string | string[] }>;
};

const CreateProductPage = async ({ searchParams }: CreateProductPageProps) => {
  const { from } = await searchParams;
  const sourceId = typeof from === "string" ? from : undefined;
  let initialValues: ProductFormValues | undefined;

  if (sourceId) {
    const session = await requireSession();
    const source = await getProduct({ id: sourceId, userId: session.user.id });

    if (!source) redirect(productCreateRoute());

    initialValues = {
      ...toProductFormValues(source),
      images: [],
    };
  }

  const isSellSimilar = sourceId !== undefined;

  return (
    <>
      <PageHeader
        title="New product"
        description="Create a master listing to publish across your eBay accounts."
      >
        {!!isSellSimilar && (
          <Badge variant="secondary">
            <CopyPlus />
            Copied from an existing product
          </Badge>
        )}
      </PageHeader>
      <ProductForm initialValues={initialValues} />
    </>
  );
};

export default CreateProductPage;
