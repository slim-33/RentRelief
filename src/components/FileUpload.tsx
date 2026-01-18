import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          selectedFile && 'border-solid border-primary'
        )}
      >
        <CardContent className="p-8">
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center py-8 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Rental Contract</h3>
              <p className="text-muted-foreground text-center mb-4">
                Drag and drop your PDF or TXT file here, or click to browse
              </p>
              <label htmlFor="file-input">
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: PDF, TXT • Your files stay private
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="flex items-center gap-4 w-full p-4 bg-muted/50 rounded-lg mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isProcessing}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Analyze Contract
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
