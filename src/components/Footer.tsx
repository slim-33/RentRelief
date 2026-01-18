import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="RentRescue Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">RentRescue</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RentRescue. This tool provides general information only
            and does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
