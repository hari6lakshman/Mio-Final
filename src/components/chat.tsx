'use client';

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { getMioResponse, type FormState } from '@/app/actions';
import { type Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUp, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      className="absolute bottom-2 right-2 bg-primary/80 hover:bg-primary text-primary-foreground rounded-lg disabled:bg-secondary"
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
        <div className={cn('flex items-start gap-4', !isModel && 'flex-row-reverse')}>
            <Avatar className={cn('w-8 h-8 border-2', isModel ? 'border-primary/50' : 'border-secondary-foreground/50')}>
                <AvatarFallback className={cn(isModel ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground')}>
                    {isModel ? <Bot size={18}/> : <User size={18}/>}
                </AvatarFallback>
            </Avatar>
            <div className={cn(
                'max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-md',
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
    );
}

export function Chat() {
  const [state, formAction] = useActionState(getMioResponse, initialState);
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
    if (!prompt.trim()) return;

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
        <form ref={formRef} action={formAction}>
          <div className="relative">
            <AutoSizingTextarea
                name="prompt"
                placeholder="Enlighten me about..."
                className="w-full resize-none max-h-36 rounded-lg border border-input bg-secondary/50 pr-14 pl-4 py-3 text-base"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const form = e.currentTarget.form;
                        if (form) {
                            handleAction(new FormData(form));
                            form.requestSubmit();
                        }
                    }
                }}
            />
            <input type="hidden" name="history" defaultValue="[]" />
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}