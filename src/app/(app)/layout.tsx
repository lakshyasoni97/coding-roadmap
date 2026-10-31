import { TopBar } from '@/components/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}
