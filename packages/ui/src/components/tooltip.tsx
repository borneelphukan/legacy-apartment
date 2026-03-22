import React, { createContext, useContext, useState, useRef } from 'react';

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  delayDuration: number;
}
const TooltipContext = createContext<TooltipContextType | null>(null);

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Tooltip = ({ 
  children, 
  delayDuration = 200 
}: { 
  children: React.ReactNode;
  delayDuration?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen, delayDuration }}>
      <div className="relative inline-flex items-center justify-center">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children }: { children: React.ReactElement<any> }) => {
  const ctx = useContext(TooltipContext);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      ctx?.setIsOpen(true);
    }, ctx?.delayDuration || 0);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    ctx?.setIsOpen(false);
  };

  if (!ctx || !children) return children;

  return React.cloneElement(children, {
    onMouseEnter: (e: any) => {
      handleMouseEnter();
      if (children.props && typeof children.props.onMouseEnter === 'function') {
         children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: any) => {
      handleMouseLeave();
      if (children.props && typeof children.props.onMouseLeave === 'function') {
         children.props.onMouseLeave(e);
      }
    },
  } as any);
};

export const TooltipContent = ({ 
  children, 
  side = 'top',
  className = '',
  header,
  content
}: { 
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  header?: React.ReactNode;
  content?: React.ReactNode;
}) => {
  const ctx = useContext(TooltipContext);
  if (!ctx || !ctx.isOpen) return null;

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div 
      className={`absolute z-50 px-3 py-2 text-sm rounded-lg bg-gray-900 text-white shadow-lg animate-in fade-in zoom-in-95 duration-200 ${sideClasses[side]} ${className}`}
      style={{ maxWidth: '288px' }}
    >
      {header && <div className="mb-1 font-semibold">{header}</div>}
      {content && <p className="text-gray-200 leading-relaxed">{content}</p>}
      {!header && !content && children}
      <div className={`absolute w-0 h-0 border-[5px] ${arrowClasses[side]}`} />
    </div>
  );
};
