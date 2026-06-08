import { Gem, Globe, Layers, ShieldCheck, type LucideIcon } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Typography } from "@/components/typography";

type PanelFeature = {
  icon: LucideIcon;
  label: string;
  description: string;
};

const FEATURES: PanelFeature[] = [
  {
    icon: Layers,
    label: "One master catalogue",
    description: "Build a listing once, keep it in sync everywhere.",
  },
  {
    icon: Globe,
    label: "Multi-account publishing",
    description: "Push to every connected eBay seller account.",
  },
  {
    icon: ShieldCheck,
    label: "Secure by default",
    description: "Tokens encrypted at rest, never exposed.",
  },
];

export const AuthLeftPanel = () => {
  return (
    <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-neutral-50 lg:flex">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.05] bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] bg-size-[22px_22px]" />
      <Gem className="absolute -right-12 -bottom-12 -z-10 size-72 rotate-12 text-white/5" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent to-black/50" />

      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
          <Gem className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <div className="flex flex-col gap-6">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">
          Multi-account eBay listing
        </span>
        <Typography variant="h2" as="p" className="text-balance">
          List your jewellery across every eBay account, from one place.
        </Typography>
        <Typography as="p" className="text-pretty text-white/65">
          Build a listing once and publish it everywhere you sell. Track every
          publication and manage your catalogue without the busywork.
        </Typography>

        <ul className="mt-2 flex flex-col divide-y divide-white/10 border-y border-white/10">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-start gap-3.5 py-4">
              <feature.icon className="mt-0.5 size-4 shrink-0 text-white/70" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{feature.label}</span>
                <span className="text-xs text-white/55">
                  {feature.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
        <span className="size-1.5 rounded-full bg-white/50" />
        Built for jewellery sellers
      </div>
    </div>
  );
};
