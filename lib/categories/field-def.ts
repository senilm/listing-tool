import { type AspectGroup } from "@/lib/categories/aspect-group";

export enum FieldInput {
  Enum = "enum",
  Text = "text",
  MultiSelect = "multiselect",
}

export type FieldDef = {
  aspect: string; // Exact eBay aspect name, e.g. "Ring Size" or "Main Stone".
  input: FieldInput;
  group: AspectGroup;
  options?: readonly string[]; // Dropdown options for Enum/MultiSelect inputs; omitted for Text.
  required?: boolean;
};
