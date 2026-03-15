import { forwardRef, useState } from "react";
import { Icon } from './icon';
import Button from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdownMenu";

type DropdownConfig = {
  value: React.ReactNode;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
};

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
  icon?: {
    left?: React.ComponentType<{ className?: string }>;
    right?: React.ComponentType<{ className?: string }>;
  };
  dropdown?: {
    left?: DropdownConfig;
    right?: DropdownConfig;
  };
  inputButton?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  required?: boolean;
  options?: string[];
  selectedOption?: string;
  onOptionChange?: (option: string) => void;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      icon,
      dropdown,
      inputButton,
      hideLabel,
      hint,
      error,
      required,
      disabled,
      options,
      selectedOption,
      onOptionChange,
      type,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleSelectorChange = (direction: "up" | "down") => {
      if (!options?.length || !onOptionChange || !selectedOption) return;

      const currentIndex = options.indexOf(selectedOption);
      if (currentIndex === -1) return;

      let nextIndex = 0;

      if (direction === "up") {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      } else {
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      }

      onOptionChange(options[nextIndex]);
    };

    const inputType = (() => {
      if (options) return "number";
      if (type === "password") return showPassword ? "text" : "password";
      return type;
    })();

    const isPasswordField = type === "password";

    const LeftIcon = icon?.left;
    const RightIcon = icon?.right;

    return (
      <div className={`flex flex-col gap-1.5 group/input ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
        <label
          className={`flex flex-col gap-1.5 ${disabled ? "pointer-events-none" : ""}`}
          htmlFor={id}
        >
          <span
            className={
              hideLabel
                ? "sr-only"
                : "text-gray-100 font-medium text-sm group-focus-within/input:text-gray-100"
            }
          >
            {label}
            {required && <span className="text-red-200 ml-1">*</span>}
          </span>
          <div
            className={`flex flex-row gap-2 items-center py-2 px-3 rounded-lg border border-gray-400 shadow-xs shadow-black/20 transition-colors ${
              error ? "border-red-200" : ""
            } group-focus-within/input:!ring-[2px] group-focus-within/input:!ring-offset-2 ${
              error
                ? "group-focus-within/input:!ring-red-200"
                : "group-focus-within/input:!ring-orange-500"
            } ${className || ""}`}
          >
            {dropdown?.left && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-100 text-sm font-medium shrink-0 flex items-center gap-1 hover:text-gray-100 transition-colors focus:outline-none"
                  >
                    {dropdown.left.value}
                    <Icon type="arrow_drop_down" className="text-[16px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {dropdown.left.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => dropdown.left?.onSelect(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {LeftIcon && (
              <LeftIcon
                className="text-gray-100 group-focus-within/input:text-gray-100 shrink-0"
              />
            )}

            <input
              className={`border-none px-0.5 flex-1 w-full placeholder-gray-300 focus:outline-none focus:placeholder-gray-200 text-sm leading-none ${
                options ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""
              }`}
              id={id}
              name={id}
              ref={ref}
              type={inputType}
              value={value}
              {...props}
            />

            {isPasswordField && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-100 hover:text-gray-300 transition-colors shrink-0 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <Icon type="visibility_off" className="text-[20px]" />
                ) : (
                  <Icon type="visibility" className="text-[20px]" />
                )}
              </button>
            )}
            {RightIcon && !isPasswordField && (
              <RightIcon
                className="text-gray-100 group-focus-within/input:text-gray-100 shrink-0"
              />
            )}
            {inputButton && (
              <Button
                type="button"
                variant="primary"
                disabled={inputButton.disabled}
                onClick={inputButton.onClick}
                className="!py-1 !px-4 !text-xs"
              >
                {inputButton.label}
              </Button>
            )}

            {options && (
              <div className="flex flex-row items-center gap-2 shrink-0">
                <div className="flex flex-col gap-0 -my-1">
                  <button
                    type="button"
                    onClick={() => handleSelectorChange("up")}
                    tabIndex={-1}
                    className="text-gray-400 hover:text-gray-100 active:text-brand-green transition-colors flex items-center justify-center h-3"
                  >
                    <Icon type="keyboard_arrow_up" className="text-[16px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectorChange("down")}
                    tabIndex={-1}
                    className="text-gray-300 hover:text-gray-100 active:text-brand-green transition-colors flex items-center justify-center h-3"
                  >
                    <Icon type="keyboard_arrow_down" className="text-[16px]" />
                  </button>
                </div>
                {selectedOption && (
                  <div className="text-black text-sm font-medium select-none min-w-[60px] text-right">
                    {selectedOption}
                  </div>
                )}
              </div>
            )}

            {!options && dropdown?.right && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-100 text-sm font-medium shrink-0 flex items-center gap-1 hover:text-gray-200 transition-colors focus:outline-none"
                  >
                    {dropdown.right.value}
                    <Icon type="arrow_drop_down" className="text-[16px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdown.right.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => dropdown.right?.onSelect(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {(hint || error) && (
            <div className="flex flex-col gap-1 pt-0.5">
              {hint && (
                <span className="font-normal text-xs">
                  {hint}
                </span>
              )}
              {error && <span className="text-red-200 text-xs">{error}</span>}
            </div>
          )}
        </label>
      </div>
    );
  }
);

export { Input };

