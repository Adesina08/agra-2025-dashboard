import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-lg font-medium text-foreground">AGRA 2025</h1>
        <p className="text-sm text-muted-foreground">Quality Control Dashboard</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
