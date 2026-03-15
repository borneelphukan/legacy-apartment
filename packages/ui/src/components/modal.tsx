import React, { useState, useEffect } from "react";
import { Icon } from "./icon";

interface ModalProps {
  title: string;
  description?: string;
  showCloseButton?: boolean;
  trigger?: React.ReactElement<any>;
  actions?: React.ReactElement<any>[];
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Modal = ({
  title,
  description,
  showCloseButton = true,
  trigger,
  actions = [],
  content,
  open,
  onOpenChange,
}: ModalProps) => {
  const [internalOpen, setInternalOpen] = useState(open || false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (open !== undefined && !isControlled) {
      setInternalOpen(open);
    }
  }, [open, isControlled]);

  const TriggerButton = trigger 
    ? React.cloneElement(trigger, { 
        onClick: (e: any) => {
          if (trigger.props && typeof trigger.props.onClick === 'function') {
            trigger.props.onClick(e);
          }
          handleOpenChange(true);
        }
      })
    : null;

  return (
    <>
      {TriggerButton}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0"
            onClick={() => handleOpenChange(false)}
          />
          <div className="relative flex flex-col w-full max-w-lg rounded-2xl border-gray-400 p-[3px] bg-white/60 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="flex flex-col w-full rounded-[14px] border border-gray-300 bg-white overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-400 bg-gray-50 shrink-0">
              <div className="flex flex-col gap-1 min-w-0 pr-4">
                <h3 className="text-xl font-bold text-gray-900 truncate">{title}</h3>
                {description && <p className="text-sm font-medium text-gray-100 break-words">{description}</p>}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="size-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Icon type="close" className="text-gray-200 text-[20px]" />
                  <span className="sr-only">Close</span>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {content}
            </div>

            {/* Footer */}
            {actions && actions.length > 0 && (
              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-400 shrink-0">
                {actions.map((action, index) => 
                  React.cloneElement(action, { key: index })
                )}
              </div>
            )}
            
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { Modal };
