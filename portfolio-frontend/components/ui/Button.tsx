import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface BaseButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children?: React.ReactNode;
}

// When href is provided, render as a Link
interface ButtonAsLink extends BaseButtonProps {
  href: string;
  external?: boolean;
}

// When href is not provided, render as a button
interface ButtonAsButton extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'variant'> {
  href?: never;
  external?: never;
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-accent-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all",
  outline:
    "border border-accent-primary text-accent-primary hover:bg-accent-primary/10 transition-all",
  ghost: "text-text-secondary hover:text-text-primary transition-colors",
};

import { motion } from "framer-motion";

export default function Button(props: ButtonProps) {
  const { variant = "primary", children, className = "" } = props;
  const base = `px-6 py-3 rounded-2xl font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors ${variantStyles[variant]} ${className}`;

  const content = (
    <motion.span
      className="flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.span>
  );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={base}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={props.href} className={base}>
        {content}
      </Link>
    );
  }

  const { variant: _v, children: _c, className: _cn, ...buttonProps } = props as ButtonAsButton;
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={base}
      {...(buttonProps as any)}
    >
      {children}
    </motion.button>
  );
}
