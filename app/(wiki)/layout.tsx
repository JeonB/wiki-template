import WikiNav from '@/components/layout/wiki-nav';

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <WikiNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
