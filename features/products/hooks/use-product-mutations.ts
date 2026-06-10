import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  archiveProductRequest,
  createProductRequest,
  updateProductRequest,
} from "@/features/products/services/product-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { type ProductInput } from "@/validations/product";

// Each mutation invalidates the products prefix on success so every cached list
// refetches — no manual router.refresh().
const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productsRoot });
};

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: ProductInput) => createProductRequest(input),
    onSuccess: invalidate,
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      updateProductRequest(id, input),
    onSuccess: invalidate,
  });
};

export const useArchiveProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => archiveProductRequest(id),
    onSuccess: invalidate,
  });
};
