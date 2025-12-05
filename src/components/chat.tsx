'use client';

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { getMioResponse, type FormState } from '@/app/actions';
import { type Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutoSizingTextarea } from '@/components/ui/auto-sizing-textarea';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { useFormStatus } from 'react-dom';

const initialMessages: Message[] = [
  {
    id: '0',
    role: 'model',
    content: 'Hello, Nice to meet you. Feel free to share your doubt',
  },
];

const initialState: FormState = {
  promptId: '',
  mioResponse: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      disabled={pending}
      className="absolute bottom-2.5 right-2.5 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full shadow-lg transition-all disabled:bg-secondary disabled:shadow-none"
      aria-label="Send message"
    >
      {pending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
      ) : (
        <ArrowUp />
      )}
    </Button>
  );
}

function ChatMessage({ message }: { message: Message }) {
    const isModel = message.role === 'model';
    return (
        <div className={cn('flex items-start gap-3', !isModel && 'justify-end')}>
            <div className={cn(
                'flex flex-col gap-1.5',
                !isModel && 'items-end',
            )}>
                 <div className="text-xs font-bold text-primary px-1">
                    {isModel ? 'Mio' : 'You'}
                </div>
                <div className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 text-base shadow-[0_4px_20px_hsl(var(--primary)/0.1)]',
                    isModel ? 'bg-secondary/50 border border-border/20 text-foreground' : 'bg-primary text-primary-foreground',
                )}>
                    {typeof message.content === 'string' ? (
                        <MarkdownRenderer 
                            content={message.content} 
                            boldColorClass={isModel ? 'text-primary' : 'text-white'} 
                        />
                    ) : (
                        message.content
                    )}
                </div>
            </div>
        </div>
    );
}

export function Chat() {
  const [state, formAction, isPending] = useActionState(getMioResponse, initialState);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
      setMessages(prev => prev.filter(msg => msg.id !== 'thinking'));
    }

    if (state.mioResponse) {
      const mioMessage: Message = {
        id: state.promptId,
        role: 'model',
        content: state.mioResponse,
      };
      setMessages(prev => prev.map(msg => msg.id === 'thinking' ? mioMessage : msg));
    }
  }, [state, toast]);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleAction = (formData: FormData) => {
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim() || isPending) return;

    const history = messages.filter(m => typeof m.content === 'string');
    formData.set('history', JSON.stringify(history));
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    
    const thinkingMessage: Message = {
        id: 'thinking',
        role: 'model',
        content: (
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            </div>
        )
    }

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    formAction(formData);
    formRef.current?.reset();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-primary/20">
        <form ref={formRef} action={handleAction} onSubmit={(e) => {
          if (!isPending && (e.nativeEvent as SubmitEvent).submitter) {
            e.preventDefault();
            handleAction(new FormData(e.currentTarget));
          }
        }}>
          <div className="relative">
            <AutoSizingTextarea
                name="prompt"
                placeholder="Enlighten me about..."
                className="w-full resize-none max-h-36 rounded-xl border-2 border-input bg-secondary/50 pr-16 pl-4 py-3 text-base shadow-inner"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isPending) {
                        e.preventDefault();
                        formRef.current?.requestSubmit();
                    }
                }}
            />
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
