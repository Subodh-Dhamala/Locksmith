"use client";

import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export default function Input({
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">

      <input
        {...props}
        className={clsx(
          "w-full p-3 rounded bg-[#060e20] text-white border focus:outline-none focus:ring-2",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-700 focus:ring-blue-400",
          className
        )}
      />

      {error && (
        <p className="text-red-400 text-xs mt-1">
          {error}
        </p>
      )}

    </div>
  );
}