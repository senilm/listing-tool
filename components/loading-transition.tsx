"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";

type LoadingTransitionProps = {
  isLoading: boolean;
  loader: ReactNode;
  children: ReactNode;
  duration?: number;
  className?: string;
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Cross-fades a loader and its content instead of swapping them abruptly.
export const LoadingTransition = ({
  isLoading,
  loader,
  children,
  duration = 0.2,
  className,
}: LoadingTransitionProps) => (
  <AnimatePresence mode="wait">
    {isLoading ? (
      <motion.div
        key="loader"
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        className={className}
      >
        {loader}
      </motion.div>
    ) : (
      <motion.div
        key="content"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Same cross-fade, but renders <tbody> elements so it can wrap table rows.
export const TableLoadingTransition = ({
  isLoading,
  loader,
  children,
  duration = 0.2,
}: Omit<LoadingTransitionProps, "className">) => (
  <AnimatePresence mode="wait">
    {isLoading ? (
      <motion.tbody
        key="loader"
        data-slot="table-body"
        className="[&_tr:last-child]:border-0"
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
      >
        {loader}
      </motion.tbody>
    ) : (
      <motion.tbody
        key="content"
        data-slot="table-body"
        className="[&_tr:last-child]:border-0"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration }}
      >
        {children}
      </motion.tbody>
    )}
  </AnimatePresence>
);
