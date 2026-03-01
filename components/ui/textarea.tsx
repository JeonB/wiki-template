import * as React from 'react';

import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ className, ref, name, id, ...props }: TextareaProps) {
  const textareaId = id || name || 'textarea-field';
  const textareaName = name || 'textarea-field';

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      name={textareaName}
      id={textareaId}
      {...props}
    />
  );
}

Textarea.displayName = 'Textarea';

export { Textarea };
