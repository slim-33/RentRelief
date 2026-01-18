import { Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="RentRescue Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">RentRescue</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="w-4 h-4 text-red-500" /> for BC students
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} RentRescue. This tool provides general information only
            and does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
