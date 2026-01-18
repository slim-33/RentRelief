import { Shield, AlertTriangle, FileSearch, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Don't Sign a{' '}
            <span className="text-primary">Bad Lease</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your rental contract and instantly identify illegal clauses, hidden fees, 
            and terms that violate BC's Residential Tenancy Act. Protect yourself before you sign.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={scrollToUpload} className="text-lg px-8">
              <FileSearch className="w-5 h-5 mr-2" />
              Analyze Your Contract
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <a href="#how-it-works">Learn How It Works</a>
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>BC Law Focused</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
    </section>
  );
}
