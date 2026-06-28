"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { ConditionalTransition } from "@/components/conditional-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

enum ThemeOption {
  Light = "light",
  Dark = "dark",
  System = "system",
}

const subscribeNoop = () => () => {};

export const AppearanceSettingsCard = () => {
  const { theme, setTheme } = useTheme();

  // The active theme is only known on the client — render a skeleton until
  // hydration so the SSR and first client render match.
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how the app looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConditionalTransition
          condition={isMounted}
          whenTrue={
            <ToggleGroup
              type="single"
              variant="outline"
              value={theme}
              onValueChange={(value) => {
                if (value) setTheme(value);
              }}
            >
              <ToggleGroupItem
                value={ThemeOption.Light}
                aria-label="Light theme"
              >
                <Sun />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value={ThemeOption.Dark} aria-label="Dark theme">
                <Moon />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem
                value={ThemeOption.System}
                aria-label="System theme"
              >
                <Monitor />
                System
              </ToggleGroupItem>
            </ToggleGroup>
          }
          whenFalse={<Skeleton className="h-9 w-64" />}
        />
      </CardContent>
    </Card>
  );
};
