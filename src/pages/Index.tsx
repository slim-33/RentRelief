import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { HowItWorks } from '@/components/HowItWorks';

import { Footer } from '@/components/Footer';
import { extractTextFromFile } from '@/lib/pdfParser';
import { analyzeContract, AnalysisResult } from '@/lib/contractAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setAnalysisResults(null);

    try {
      const text = await extractTextFromFile(file);
      
      if (text.trim().length < 100) {
        toast({
          title: 'Insufficient Content',
          description: 'The document appears to be too short or empty. Please upload a complete rental contract.',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      const results = await analyzeContract(text);
      setAnalysisResults(results);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      toast({
        title: 'Analysis Complete',
        description: `Found ${results.flaggedClauses.length} notable clauses using ${results.analysisMethod === 'gemini' ? 'AI analysis' : 'pattern matching'}.`
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error Processing File',
        description: error instanceof Error ? error.message : 'Unable to process the uploaded file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResults(null);
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="upload" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Upload Your Rental Contract</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your document is processed locally in your browser. We don't store or upload your contract anywhere.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          </div>
        </section>

        {analysisResults && (
          <section id="results" className="py-20 bg-muted/30">
            <div className="container max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Analysis Results</h2>
                <Button variant="outline" onClick={handleNewAnalysis}>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Analyze Another Contract
                </Button>
              </div>
              
              <AnalysisResults results={analysisResults} />
            </div>
          </section>
        )}

        <HowItWorks />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
