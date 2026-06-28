import {
  ASPECT_GROUP_ORDER,
  type AspectGroup,
} from "@/lib/categories/aspect-group";
import { type CategoryId } from "@/lib/categories/category-id";
import { type FieldDef } from "@/lib/categories/field-def";
import { CATEGORY_REGISTRY } from "@/lib/categories/registry";

export type AspectFieldGroup = {
  group: AspectGroup;
  label: string;
  fields: FieldDef[];
};

export const groupCategoryFields = (
  categoryId: CategoryId,
): AspectFieldGroup[] => {
  const fields = CATEGORY_REGISTRY[categoryId].fields;

  return ASPECT_GROUP_ORDER.map(({ group, label }) => ({
    group,
    label,
    fields: fields.filter((field) => field.group === group),
  })).filter((entry) => entry.fields.length > 0);
};
