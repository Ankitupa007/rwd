"use client"

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun, BookOpen } from "lucide-react";

const themes = ["light", "dark", "book"];

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  const nextTheme = () => {
    const index = themes.indexOf(theme || "light");
    const newTheme = themes[(index + 1) % themes.length];
    setTheme(newTheme);
  };

  const icon = {
    light: <Moon className="size-4" />,
    dark: <BookOpen className="size-4" />,
    book: <Sun className="size-4" />,
  };

  return (
    <Button
      onClick={nextTheme}
      size="sm"
      variant="secondary"
      className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
    >
      {icon[theme] || <Moon className="size-4" />}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};
