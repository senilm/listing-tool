"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { useForm, type DefaultValues } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { NumberInput } from "@/components/number-input";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductAspectsField } from "@/features/products/components/product-aspects-field";
import { ProductImagesField } from "@/features/products/components/product-images-field";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/hooks/use-product-mutations";
import { productsRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";
import {
  productFormSchema,
  toProductInput,
  type ProductFormValues,
} from "@/validations/product";

const EMPTY_VALUES: DefaultValues<ProductFormValues> = {
  sku: "",
  title: "",
  description: "",
  basePrice: undefined,
  quantity: 1,
  images: [],
  aspects: [],
};

type ProductFormProps = {
  productId?: string;
  initialValues?: ProductFormValues;
};

export const ProductForm = ({ productId, initialValues }: ProductFormProps) => {
  const router = useRouter();
  const isEdit = productId !== undefined;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: standardSchemaResolver(productFormSchema),
    defaultValues: initialValues ?? EMPTY_VALUES,
  });

  const onSubmit = async (values: ProductFormValues) => {
    const input = toProductInput(values);

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: productId, input });
      } else {
        await createProduct.mutateAsync(input);
      }
    } catch {
      toast.error(isEdit ? "Could not save the product" : "Could not create the product");
      return;
    }

    toast.success(isEdit ? "Product saved" : "Product created");
    router.push(productsRoute());
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <form
      onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
      className="flex max-w-2xl flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend>Details</FieldLegend>
        <FieldGroup>
          <FormField
            control={form.control}
            name="title"
            label="Title"
            required
            render={(field) => (
              <Input placeholder="18ct Gold Diamond Ring" maxLength={200} {...field} />
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            label="SKU"
            render={(field) => (
              <Input placeholder="Optional stock-keeping unit" maxLength={100} {...field} />
            )}
          />
          <FormField
            control={form.control}
            name="description"
            label="Description"
            render={(field) => (
              <Textarea
                placeholder="Describe the piece — materials, dimensions, hallmarks…"
                rows={5}
                {...field}
              />
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Pricing & stock</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="basePrice"
              label="Price (USD)"
              required
              render={(field) => (
                <NumberInput placeholder="0.00" step="0.01" {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              label="Quantity"
              required
              render={(field) => <NumberInput placeholder="1" {...field} />}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Images</FieldLegend>
        <ProductImagesField control={form.control} />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Item specifics</FieldLegend>
        <ProductAspectsField control={form.control} />
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(productsRoute())}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
};
