"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      themes={["light", "dark", "book"]}
      defaultTheme="system"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
