import React from "react";

interface Props {
  size?: "large" | "small";
  variant?: "normal" | "minimal";
  status?: number;
}

export const StatusLight = ({ size = "large", variant = "normal", status = 0 }: Props) => {
  // Color configuration mapping
  const config = {
    1: {
      dot: "bg-green-200",
      container: "bg-green-400 border-green-200",
      outline: "outline-green-200",
      label: "Paid",
    },
    0: {
      dot: "bg-slate-300",
      container: "bg-slate-50 border-slate-200",
      outline: "outline-slate-300",
      label: "Future",
    },
    "-1": {
      dot: "bg-red-200",
      container: "bg-red-400 border-red-200",
      outline: "outline-red-200",
      label: "Unpaid",
    },
  };

  const current = config[status as keyof typeof config] || config[0];

  const dot = (
    <div
      className={`
        rounded-lg outline outline-offset-2 flex-shrink-0 transition-all duration-300
        ${size === "small" ? "w-1.5 h-1.5" : "w-1.5 h-1.5 md:w-2 md:h-2"}
        ${current.dot}
        ${current.outline}
      `}
    />
  );

  if (variant === "minimal") {
    return dot;
  }

  return (
    <div
      className={`
        rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 mx-auto
        ${size === "small" ? "w-6 h-6 md:w-7 md:h-7" : "w-8 h-8 md:w-10 md:h-10"}
        ${current.container}
      `}
      title={current.label}
    >
      {dot}
    </div>
  );
};
