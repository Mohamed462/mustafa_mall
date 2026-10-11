import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextureButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'default' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const TextureButton: React.FC<TextureButtonProps> = ({
  variant = 'primary',
  size = 'default',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = clsx(
    'relative inline-flex items-center justify-center font-medium select-none overflow-hidden transition-all duration-300 ease-out cursor-pointer active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
    // Noise micro-texture overlay from Kairo UI
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-40 after:mix-blend-overlay',
    "after:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27160%27%20height=%27160%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.8%27%20numOctaves=%272%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')]"
  );

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-[#08606B] to-[#04383f] text-white border border-[#0d8391]/40 shadow-tactile hover:from-[#0d8391] hover:to-[#08606B]',
    accent:
      'bg-gradient-to-b from-[#00D2D3] to-[#00b8b9] text-[#04383f] font-bold border border-[#00D2D3]/60 shadow-md hover:from-[#33ddde] hover:to-[#00D2D3]',
    secondary:
      'bg-gradient-to-b from-white to-[#f8fafb] text-[#11151a] border border-[rgba(17,21,26,0.12)] shadow-sm hover:bg-[#f3f4f6]',
    dark:
      'bg-gradient-to-b from-[#1e262c] to-[#11151a] text-white border border-white/10 shadow-md hover:from-[#2a353d] hover:to-[#1e262c]',
    outline:
      'bg-transparent text-[#08606B] border border-[#08606B]/30 hover:bg-[#08606B]/5',
    destructive:
      'bg-gradient-to-b from-rose-600 to-rose-700 text-white border border-rose-500/40 shadow-sm hover:from-rose-500 hover:to-rose-600',
  }[variant];

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    default: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-xl aspect-square',
  }[size];

  return (
    <button
      className={twMerge(baseClasses, variantClasses, sizeClasses, className)}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
