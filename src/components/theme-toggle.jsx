"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun, CloudMoon } from "lucide-react";
import { useEffect, useState } from "react";

const themes = ["dark", "light", "book"];

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextTheme = () => {
    const index = themes.indexOf(theme || "dark");
    const newTheme = themes[(index + 1) % themes.length];
    setTheme(newTheme);
  };

  const icon = {
    dark: <Sun className="size-4" />,
    light: <CloudMoon className="size-4" />,
    book: <Moon className="size-4" />,
  };

  // Prevent hydration mismatch by not rendering the button until mounted
  if (!mounted) {
    return null;
  }

  return (
    <Button
      onClick={nextTheme}
      size="sm"
      variant="secondary"
      className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
    >
      {icon[theme || "dark"]}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};
