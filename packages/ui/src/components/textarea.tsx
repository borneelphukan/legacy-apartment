import * as React from "react";
import { forwardRef } from "react";

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  required?: boolean;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      id,
      label,
      hideLabel,
      hint,
      error,
      placeholder,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <label className="flex flex-col gap-1.5 group/input disabled:pointer-events-none">
        <span
          className={
            hideLabel
              ? "sr-only"
              : "text-gray-100 font-medium text-sm group-focus-within/input:text-gray-100"
          }
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>

        <div
          className={`flex flex-row gap-2 items-start py-2 px-3 rounded-md border-1 border-gray-400 shadow-xs shadow-black/20 transition-colors ${
            error ? "border-red-200" : ""
          } group-focus-within/input:!ring-[2px] group-focus-within/input:!ring-offset-2 ${
            error
              ? "group-focus-within/input:!ring-red-200"
              : "group-focus-within/input:!ring-orange-500"
          } ${className || ""}`}
        >
          <textarea
            className="border-none bg-transparent px-0.5 w-full placeholder-gray-100 focus:outline-none focus:placeholder-gray-100 text-sm min-h-16 field-sizing-content"
            id={id}
            name={id}
            ref={ref}
            placeholder={placeholder}
            {...props}
          />
        </div>
        {hint && (
          <span className="text-gray-100 font-normal text-xs">
            {hint}
          </span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </label>
    );
  }
);

export { TextArea };

