import { cn } from "@/lib/utils";

export function MioLogo({ className }: { className?: string }) {
  return (
    <h1 className={cn("text-4xl font-headline text-primary tracking-widest", className)}>
      Mio
    </h1>
  );
}
