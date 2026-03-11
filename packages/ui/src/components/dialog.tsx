import * as React from "react";
import CloseIcon from '@mui/icons-material/Close';

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalOpen(val);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children }: { children: React.ReactElement }) {
  const context = React.useContext(DialogContext);
  if (!context) return children;

  return React.cloneElement(children, {
    // @ts-ignore - Handle various element types
    onClick: (e: React.MouseEvent) => {
      const childProps = (children as any).props;
      if (childProps && typeof childProps.onClick === 'function') {
        childProps.onClick(e);
      }
      context.setOpen(true);
    },
  });
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const context = React.useContext(DialogContext);
  if (!context || !context.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {children}
    </div>
  );
}

function DialogOverlay() {
  const context = React.useContext(DialogContext);
  if (!context) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => context.setOpen(false)}
    />
  );
}

function DialogContent({
  className = "",
  children,
  showCloseButton = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 
  showCloseButton?: boolean;
}) {
  const context = React.useContext(DialogContext);
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={`relative flex flex-col w-full max-w-lg rounded-2xl border border-gray-400 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${className}`.trim()}
        {...props}
      >
        <div className="flex-1 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={() => context?.setOpen(false)}
            className="absolute top-4 right-4 size-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-[110]"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col gap-2 px-6 py-4 bg-gray-50/50 shrink-0 ${className}`.trim()}
      {...props}
    />
  );
}

function DialogFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-row justify-end gap-3 px-6 py-2 bg-gray-50 border-t border-gray-400 shrink-0 ${className}`.trim()}
      {...props}
    />
  );
}

function DialogTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xl font-bold text-gray-900 truncate ${className}`.trim()}
      {...props}
    />
  );
}

function DialogDescription({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm font-medium text-gray-100 break-words ${className}`.trim()}
      {...props}
    />
  );
}

function DialogClose({ children }: { children: React.ReactElement }) {
  const context = React.useContext(DialogContext);
  if (!context) return children;

  return React.cloneElement(children, {
    // @ts-ignore
    onClick: (e: React.MouseEvent) => {
      const childProps = (children as any).props;
      if (childProps && typeof childProps.onClick === 'function') {
        childProps.onClick(e);
      }
      context.setOpen(false);
    },
  });
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
