import { createContext, useContext } from "react";

// Creates a context whose hook throws if used outside its provider — removes the
// optional-chaining/undefined checks every consumer would otherwise need.
export const getStrictContext = <T>(name: string) => {
  const Context = createContext<T | undefined>(undefined);

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(`${name} is missing a Context Provider`);
    }
    return ctx;
  };

  return [Context.Provider, useStrictContext] as const;
};
