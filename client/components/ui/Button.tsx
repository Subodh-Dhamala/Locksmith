"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={clsx(
        "w-full p-3 rounded font-semibold transition",
        loading && "opacity-60 cursor-not-allowed",
        disabled && "opacity-60 cursor-not-allowed",
        "bg-blue-400 text-black hover:bg-blue-500",
        className
      )}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}