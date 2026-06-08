import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/features/products/components/product-form";

const CreateProductPage = () => {
  return (
    <div>
      <PageHeader
        title="New product"
        description="Create a master listing to publish across your eBay accounts."
      />
      <ProductForm />
    </div>
  );
};

export default CreateProductPage;
