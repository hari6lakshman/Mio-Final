'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';

type AutoSizingTextareaProps = React.ComponentProps<'textarea'>;

const AutoSizingTextarea = React.forwardRef<HTMLTextAreaElement, AutoSizingTextareaProps>(
  (props, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(ref, () => internalRef.current);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (internalRef.current) {
        internalRef.current.style.height = 'auto';
        const scrollHeight = internalRef.current.scrollHeight;
        internalRef.current.style.height = `${scrollHeight}px`;
      }
      if (props.onInput) {
        props.onInput(event);
      }
    };
    
    // Also adjust height when value is changed programmatically (e.g., form reset)
    React.useEffect(() => {
        if (internalRef.current) {
            handleInput({ currentTarget: internalRef.current } as React.FormEvent<HTMLTextAreaElement>);
        }
    }, [props.value]);


    return <Textarea ref={internalRef} {...props} onInput={handleInput} />;
  }
);

AutoSizingTextarea.displayName = 'AutoSizingTextarea';

export { AutoSizingTextarea };
