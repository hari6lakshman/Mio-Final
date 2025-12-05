import { Chat } from "@/components/chat";
import { MioLogo } from "@/components/mio-logo";

export default function Home() {
  return (
    <div className="h-screen w-screen p-4 sm:p-6 md:p-8 bg-background">
      <div className="h-full w-full rounded-xl border-2 border-primary/40 shadow-2xl shadow-primary/20 flex flex-col overflow-hidden">
        <header className="flex items-center justify-center p-4 border-b border-primary/20 shadow-lg shadow-primary/5">
          <div className="flex flex-col items-center">
            <MioLogo />
            <p className="text-sm text-primary/80 -mt-1">
              powered by studygram
            </p>
          </div>
        </header>
        <main className="flex-1 min-h-0">
          <Chat />
        </main>
      </div>
    </div>
  );
}
