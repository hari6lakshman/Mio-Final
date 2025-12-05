import { Chat } from "@/components/chat";
import { MioLogo } from "@/components/mio-logo";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-center p-4 border-b border-primary/20 shadow-lg shadow-primary/5">
        <div className="flex items-baseline gap-2">
          <MioLogo />
          <p className="text-xs text-muted-foreground">powered by studygram</p>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <Chat />
      </main>
    </div>
  );
}
