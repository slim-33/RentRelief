import { AlertTriangle, CheckCircle, Info, Shield, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnalysisResult } from '@/lib/contractAnalyzer';
import { categoryLabels, severityColors } from '@/data/bcRentalClauses';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  results: AnalysisResult;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const { summary, keyDetails, flaggedClauses, overallRiskScore, recommendations } = results;
  
  const maliciousClauses = flaggedClauses.filter(f => f.clause.isMalicious);
  const informationalClauses = flaggedClauses.filter(f => !f.clause.isMalicious);
  
  const getRiskLevel = (score: number) => {
    if (score === 0) return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 30) return { label: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score < 60) return { label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };
  
  const riskLevel = getRiskLevel(overallRiskScore);

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <Card className="overflow-hidden">
        <div className={cn('p-1', riskLevel.bg)}>
          <CardHeader className="bg-card rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className={cn('w-8 h-8', riskLevel.color)} />
                <div>
                  <CardTitle>Contract Risk Assessment</CardTitle>
                  <CardDescription>Based on BC Residential Tenancy Act</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className={cn('text-3xl font-bold', riskLevel.color)}>
                  {overallRiskScore}%
                </div>
                <Badge variant="outline" className={cn(riskLevel.color)}>
                  {riskLevel.label}
                </Badge>
              </div>
            </div>
            
            {/* Analysis Method Badge */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {results.analysisMethod === 'gemini' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered Analysis
                </Badge>
              )}
              {results.analysisMethod === 'keyword' && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  Pattern Matching
                </Badge>
              )}
              {results.confidence && (
                <Badge variant="outline" className="text-xs">
                  Confidence: {results.confidence}%
                </Badge>
              )}
              {results.processingTime && (
                <span className="text-xs text-muted-foreground">
                  Analyzed in {(results.processingTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </CardHeader>
        </div>
        <CardContent className="pt-4">
          <p className="text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Key Details */}
      {(() => {
        const detailMap = new Map(keyDetails.map(detail => [detail.label, detail.value]));
        const expectedLabels = [
          'Property Address',
          'Landlord Name',
          'Monthly Rent',
          'Security Deposit',
          'Lease Start Date',
          'Lease End Date',
          'Notice Period'
        ];

        const displayDetails = expectedLabels.map(label => ({
          label,
          value: detailMap.get(label) ?? 'Not listed'
        }));

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Key Details Extracted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {displayDetails.map((detail) => (
                  <div key={detail.label} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Flagged Clauses - Malicious */}
      {maliciousClauses.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Potentially Problematic Clauses ({maliciousClauses.length})
            </CardTitle>
            <CardDescription>
              These clauses may violate BC tenancy laws or be unfavorable to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {maliciousClauses.map((flagged, index) => (
                <AccordionItem key={flagged.clause.id} value={flagged.clause.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge className={severityColors[flagged.clause.severity]}>
                        {flagged.clause.severity.toUpperCase()}
                      </Badge>
                      <span>{flagged.clause.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div>
                        <p className="text-sm font-medium mb-1">Why this is concerning:</p>
                        <p className="text-sm text-muted-foreground">{flagged.clause.explanation}</p>
                      </div>
                      {flagged.clause.legalReference && (
                        <div>
                          <p className="text-sm font-medium mb-1">Legal Reference:</p>
                          <Badge variant="outline">{flagged.clause.legalReference}</Badge>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium mb-1">Found in contract:</p>
                        <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                          {flagged.matchedText}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Informational Clauses */}
      {informationalClauses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Other Notable Clauses ({informationalClauses.length})
            </CardTitle>
            <CardDescription>
              Standard clauses that you should be aware of
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {informationalClauses.map((flagged) => (
                <AccordionItem key={flagged.clause.id} value={flagged.clause.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Badge variant="secondary">
                        {categoryLabels[flagged.clause.category]}
                      </Badge>
                      <span>{flagged.clause.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <p className="text-sm text-muted-foreground">{flagged.clause.explanation}</p>
                      <div>
                        <p className="text-sm font-medium mb-1">Found in contract:</p>
                        <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                          {flagged.matchedText}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* No Issues Found */}
      {flaggedClauses.length === 0 && (
        <Card className="border-green-500/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Detected</h3>
            <p className="text-muted-foreground text-center">
              We didn't find any obviously problematic clauses in this contract.
              However, always read the full document carefully before signing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Disclaimer:</strong> This analysis is for informational purposes only and does not constitute legal advice. 
            For specific legal questions, please consult with a lawyer or contact the BC Residential Tenancy Branch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
