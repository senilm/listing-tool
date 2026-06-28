"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";

type ConditionalTransitionProps = {
  condition: boolean;
  whenTrue: ReactNode;
  whenFalse: ReactNode;
  duration?: number;
  className?: string;
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Cross-fades between two mutually exclusive views as `condition` flips.
export const ConditionalTransition = ({
  condition,
  whenTrue,
  whenFalse,
  duration = 0.2,
  className,
}: ConditionalTransitionProps) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={condition ? "whenTrue" : "whenFalse"}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration }}
      className={className}
    >
      {condition ? whenTrue : whenFalse}
    </motion.div>
  </AnimatePresence>
);
