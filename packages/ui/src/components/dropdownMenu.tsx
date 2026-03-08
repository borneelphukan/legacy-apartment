import * as React from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setAnchorEl(e.currentTarget);
    context.setOpen(!context.open);
    if (props.onClick) props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  children,
  align = "start",
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context || !context.open) return null;

  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => context.setOpen(false)} 
      />
      <div
        className={`absolute ${alignClass} z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-neutral-light-gray bg-white p-1 shadow-md origin-top-left transition-all ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

function DropdownMenuItem({
  className,
  onClick,
  children,
  ...props
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick();
    if (context) context.setOpen(false);
  };

  return (
    <div
      className={`relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-neutral-light-gray/20 focus:bg-neutral-light-gray/20 select-none ${className || ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`px-2 py-1.5 text-sm font-medium text-neutral-dark-gray ${className || ""}`}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={`-mx-1 my-1 h-px bg-neutral-light-gray/40 ${className || ""}`} />;
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}) {
  return (
    <DropdownMenuItem className={className} onClick={onClick} {...props}>
      <span className="flex size-3.5 items-center justify-center mr-2">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

function DropdownMenuRadioItem({
  className,
  children,
  checked,
  onClick,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}) {
  return (
    <DropdownMenuItem className={className} onClick={onClick} {...props}>
      <span className="flex size-3.5 items-center justify-center mr-2">
        {checked && <FiberManualRecordIcon className="text-[10px] fill-current" />}
      </span>
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  // Simplified submenus could be implemented similarly with nested context or state
  return <div className="relative group/sub">{children}</div>;
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-light-gray/20 ${className || ""}`}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  );
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute left-full top-0 z-50 hidden min-w-[8rem] overflow-hidden rounded-md border border-neutral-light-gray bg-white p-1 shadow-lg group-hover/sub:block ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`ml-auto text-xs tracking-widest text-neutral-gray ${className || ""}`}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};

