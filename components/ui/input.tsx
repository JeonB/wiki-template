import * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, ref, name, id, ...props }: InputProps) {
  const inputId = id || name || 'input-field';
  const inputName = name || 'input-field';

  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      name={inputName}
      id={inputId}
      {...props}
    />
  );
}

Input.displayName = 'Input';

export { Input };
