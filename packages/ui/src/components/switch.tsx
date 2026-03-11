import * as React from "react";
import { forwardRef, useState } from "react";

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange"
> & {
  id: string;
  label?: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className = "",
      id,
      label,
      hideLabel,
      hint,
      error,
      checked,
      defaultChecked,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const displayChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;

      const newCheckedState = !displayChecked;

      if (!isControlled) {
        setInternalChecked(newCheckedState);
      }

      onChange?.(newCheckedState);
    };

    return (
      <div className={`flex flex-col gap-1.5 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            onClick={handleClick}
            className={`text-sm font-medium ${
              disabled ? "text-gray-400" : "text-gray-100"
            } ${hideLabel ? "sr-only" : "cursor-pointer"}`}
          >
            {label}
          </label>

          <button
            id={id}
            ref={ref}
            type="button"
            role="switch"
            aria-checked={displayChecked}
            aria-readonly={disabled}
            disabled={disabled}
            onClick={handleClick}
            {...props}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/20
              transition-colors duration-200 ease-in-out
              ml-2
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${displayChecked ? "bg-orange-500" : "bg-gray-400"}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
          >
            <span
              aria-hidden="true"
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                transition duration-200 ease-in-out
                ${displayChecked ? "translate-x-5" : "translate-x-0"}
              `.trim().replace(/\s+/g, ' ')}
            />
          </button>
        </div>

        {hint && (
          <span className="text-gray-100/70 font-normal text-xs leading-tight">{hint}</span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
