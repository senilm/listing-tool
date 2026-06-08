import { Gem, Globe, Layers, ShieldCheck, type LucideIcon } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Typography } from "@/components/typography";

type PanelFeature = {
  icon: LucideIcon;
  label: string;
};

const FEATURES: PanelFeature[] = [
  { icon: Layers, label: "One master catalogue" },
  { icon: Globe, label: "Multi-account publishing" },
  { icon: ShieldCheck, label: "Secure by default" },
];

export const AuthLeftPanel = () => {
  return (
    <div className="relative hidden w-1/2 max-w-xl shrink-0 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-white/10">
          <Gem className="size-5" />
        </div>
        <span className="text-lg font-semibold">{APP_NAME}</span>
      </div>

      <div className="flex flex-col gap-4">
        <Typography variant="h2" as="p" className="text-balance">
          List your jewellery across every eBay account, from one place.
        </Typography>
        <Typography as="p" className="text-primary-foreground/70">
          Build a listing once and publish it to all your connected eBay seller
          accounts. Track every publication and manage your catalogue without the
          busywork.
        </Typography>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.label}
            className="flex flex-col gap-2.5 rounded-lg border border-white/10 p-3"
          >
            <feature.icon className="size-6 text-primary-foreground/65" />
            <span className="text-xs font-medium text-primary-foreground/65">
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
