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
import { EnumSelectField } from "@/features/products/components/enum-select-field";
import { ProductAspectsField } from "@/features/products/components/product-aspects-field";
import { ProductImagesField } from "@/features/products/components/product-images-field";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/hooks/use-product-mutations";
import {
  Certification,
  Department,
  MainStoneCreation,
  Metal,
  MetalPurity,
  RingStyle,
  SettingStyle,
  Sizable,
  Stone,
  StoneColor,
  StoneShape,
} from "@/lib/enums/product-aspects";
import { productsRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";
import {
  productFormSchema,
  TITLE_MAX_LENGTH,
  toProductInput,
  type ProductFormValues,
} from "@/validations/product";

const EMPTY_VALUES: DefaultValues<ProductFormValues> = {
  title: "",
  description: "",
  brand: "",
  metal: "",
  metalPurity: "",
  mainStone: "",
  mainStoneCreation: "",
  mainStoneColor: "",
  mainStoneShape: "",
  totalCaratWeight: "",
  secondaryStone: "",
  settingStyle: "",
  style: "",
  department: "",
  sizable: "",
  countryRegionOfManufacture: "",
  certification: "",
  certificationNumber: "",
  jewelleryType: "",
  ringSize: "",
  basePrice: "",
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
      toast.error(
        isEdit ? "Could not save the product" : "Could not create the product",
      );
      return;
    }

    toast.success(isEdit ? "Product saved" : "Product created");
    router.push(productsRoute());
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <form
      onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
      className="flex w-full flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend>Photos</FieldLegend>
        <ProductImagesField control={form.control} />
      </FieldSet>

      <FieldSet>
        <FormField
          control={form.control}
          name="title"
          label="Title"
          required
          description="Up to 80 characters — lead with the details buyers search for."
          render={(field) => (
            <Input
              placeholder="18ct Gold Diamond Ring"
              maxLength={TITLE_MAX_LENGTH}
              {...field}
            />
          )}
        />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Item specifics</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <EnumSelectField
              control={form.control}
              name="department"
              label="Department"
              options={Object.values(Department)}
            />
            <FormField
              control={form.control}
              name="brand"
              label="Brand"
              required
              render={(field) => <Input placeholder="Unbranded" {...field} />}
            />
            <FormField
              control={form.control}
              name="jewelleryType"
              label="Type"
              required
              render={(field) => (
                <Input placeholder="Statement Ring" {...field} />
              )}
            />
            <EnumSelectField
              control={form.control}
              name="metal"
              label="Metal"
              required
              options={Object.values(Metal)}
            />
            <EnumSelectField
              control={form.control}
              name="metalPurity"
              label="Metal purity"
              required
              options={Object.values(MetalPurity)}
            />
            <EnumSelectField
              control={form.control}
              name="mainStone"
              label="Main stone"
              required
              options={Object.values(Stone)}
            />
            <EnumSelectField
              control={form.control}
              name="mainStoneColor"
              label="Main stone colour"
              options={Object.values(StoneColor)}
            />
            <EnumSelectField
              control={form.control}
              name="mainStoneCreation"
              label="Main stone creation"
              options={Object.values(MainStoneCreation)}
            />
            <FormField
              control={form.control}
              name="ringSize"
              label="Ring size"
              required
              render={(field) => <Input placeholder="7" {...field} />}
            />
            <EnumSelectField
              control={form.control}
              name="mainStoneShape"
              label="Main stone shape"
              options={Object.values(StoneShape)}
            />
            <EnumSelectField
              control={form.control}
              name="settingStyle"
              label="Setting style"
              options={Object.values(SettingStyle)}
            />
            <EnumSelectField
              control={form.control}
              name="style"
              label="Style"
              options={Object.values(RingStyle)}
            />
            <EnumSelectField
              control={form.control}
              name="sizable"
              label="Sizable"
              options={Object.values(Sizable)}
            />
            <FormField
              control={form.control}
              name="totalCaratWeight"
              label="Total carat weight"
              render={(field) => <Input placeholder="1.25" {...field} />}
            />
            <EnumSelectField
              control={form.control}
              name="secondaryStone"
              label="Secondary stone"
              options={Object.values(Stone)}
            />
            <EnumSelectField
              control={form.control}
              name="certification"
              label="Certification"
              options={Object.values(Certification)}
            />
            <FormField
              control={form.control}
              name="certificationNumber"
              label="Certification number"
              render={(field) => <Input placeholder="2141438171" {...field} />}
            />
            <FormField
              control={form.control}
              name="countryRegionOfManufacture"
              label="Country/region of manufacture"
              render={(field) => (
                <Input placeholder="United Kingdom" {...field} />
              )}
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
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
                <Input placeholder="0.00" inputMode="decimal" {...field} />
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
        <FieldLegend>Additional item specifics</FieldLegend>
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
