"use client";

import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-surface border border-border-subtle rounded-3xl overflow-hidden ${hover
          ? "hover:border-accent-primary/30 hover:shadow-[0_20px_50px_rgba(245,158,11,0.1)] transition-all"
          : ""
        } ${className}`}
    >
      {children}
    </motion.div>
  );
}
