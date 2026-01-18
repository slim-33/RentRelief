import { Upload, Search, Shield, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Contract',
    description: 'Simply drag and drop your rental agreement PDF or paste the text. Your document is processed locally for privacy.'
  },
  {
    icon: Search,
    title: 'Contract Analysis',
    description: 'Our system scans for 20+ common problematic clauses specific to BC rental laws and the Residential Tenancy Act.'
  },
  {
    icon: Shield,
    title: 'Get Risk Assessment',
    description: 'Receive an overall risk score and detailed breakdown of any concerning terms found in your lease.'
  },
  {
    icon: FileCheck,
    title: 'Take Action',
    description: 'Get clear recommendations on what to negotiate or ask about before signing your rental agreement.'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How RentSafe BC Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understand your rental contract in minutes, not hours
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20">
                {index + 1}
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
