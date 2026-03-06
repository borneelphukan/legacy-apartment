import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'transparent';

export type ButtonIconAlign = 'left' | 'right';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  icon?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: any) => void;
};

const Button = ({
  variant,
  icon,
  href,
  target,
  rel,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  let baseStyles = '';

  switch (variant) {
    case 'primary':
      baseStyles =
        'inline-flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 !text-white !px-8 !py-3 font-semibold shadow-lg shadow-orange-500/30 transform hover:scale-105 active:scale-95 !border-0';
      break;
    case 'secondary':
      baseStyles =
        'flex items-center justify-center gap-2 rounded-full font-medium transition-all text-sm md:text-base !px-4 !py-2 !bg-white !text-blue-600 !border-0 hover:scale-105 active:scale-95';
      break;
    case 'transparent':
      baseStyles =
        'group flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300 shadow-lg w-full sm:w-auto text-white font-semibold tracking-wide md:text-lg';
      break;
  }

  const combinedClassName = `${baseStyles} ${className}`.trim();

  const content = (
    <>
      {icon?.left}
      {children}
      {icon?.right}
    </>
  );

  if (href) {
    // Render as anchor if href is provided
    const { type, disabled, ...restProps } = props;
    return (
      <a href={href} className={combinedClassName} target={target} rel={rel} {...(restProps as any)}>
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {content}
    </button>
  );
};

export default Button;
