import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/features/products/components/product-form";
import { getProduct } from "@/features/products/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { toProductFormValues } from "@/validations/product";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { id } = await params;
  const session = await requireSession();
  const product = await getProduct({ id, userId: session.user.id });

  if (!product) notFound();

  return (
    <>
      <PageHeader title="Edit product" description={product.title} />
      <ProductForm
        productId={product.id}
        initialValues={toProductFormValues(product)}
      />
    </>
  );
};

export default ProductDetailPage;
