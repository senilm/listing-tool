"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

// React 19.2 warns when a client render produces an executable <script>.
// next-themes' theme script only needs to run in server-rendered HTML, so on
// the client we render it inert (text/plain) — the provider's effects handle
// theme changes there. Pattern from the Next.js "preventing flash" guide.
const themeScriptProps: ThemeProviderProps["scriptProps"] = {
  type: typeof window === "undefined" ? "text/javascript" : "text/plain",
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider scriptProps={themeScriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
};
