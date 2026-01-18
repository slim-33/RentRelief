import { bcRentalClauses, ClausePattern, categoryLabels } from '@/data/bcRentalClauses';

export interface AnalysisResult {
  summary: string;
  keyDetails: KeyDetail[];
  flaggedClauses: FlaggedClause[];
  overallRiskScore: number;
  recommendations: string[];
}

export interface KeyDetail {
  label: string;
  value: string;
  category: string;
}

export interface FlaggedClause {
  clause: ClausePattern;
  matchedText: string;
  position: number;
}

// Common patterns to extract key details
const keyDetailPatterns = [
  { label: 'Monthly Rent', pattern: /(?:monthly\s+)?rent[:\s]+\$?([\d,]+(?:\.\d{2})?)/i, category: 'rent' },
  { label: 'Security Deposit', pattern: /(?:security|damage)\s+deposit[:\s]+\$?([\d,]+(?:\.\d{2})?)/i, category: 'security_deposit' },
  { label: 'Lease Start Date', pattern: /(?:start|commencement|beginning)\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, category: 'termination' },
  { label: 'Lease End Date', pattern: /(?:end|termination|expiry)\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, category: 'termination' },
  {
    label: 'Property Address',
    pattern: /(?:property\s+address|address|premises)[:\s]+([^\r\n]+)/i,
    category: 'other'
  },
  {
    label: 'Landlord Name',
    pattern: /(?:landlord|owner|lessor)(?:\s+name)?[:\s]+([^\r\n]+)/i,
    category: 'other'
  },
  { label: 'Notice Period', pattern: /(\d+)\s*(?:days?|months?)\s+(?:written\s+)?notice/i, category: 'termination' },
];

export function analyzeContract(text: string): AnalysisResult {
  const normalizedText = text.toLowerCase();
  const flaggedClauses: FlaggedClause[] = [];
  
  // Find matching clauses
  for (const clause of bcRentalClauses) {
    for (const keyword of clause.keywords) {
      const keywordLower = keyword.toLowerCase();
      const index = normalizedText.indexOf(keywordLower);
      
      if (index !== -1) {
        // Extract surrounding context (100 chars before and after)
        const start = Math.max(0, index - 100);
        const end = Math.min(text.length, index + keyword.length + 100);
        const matchedText = text.slice(start, end);
        
        // Avoid duplicates
        const alreadyFlagged = flaggedClauses.some(f => f.clause.id === clause.id);
        if (!alreadyFlagged) {
          flaggedClauses.push({
            clause,
            matchedText: '...' + matchedText + '...',
            position: index
          });
        }
        break;
      }
    }
  }
  
  // Extract key details
  const keyDetails: KeyDetail[] = [];
  for (const pattern of keyDetailPatterns) {
    const match = text.match(pattern.pattern);
    if (match && match[1]) {
      keyDetails.push({
        label: pattern.label,
        value: match[1].trim(),
        category: pattern.category
      });
    }
  }
  
  // Calculate risk score
  const maliciousClauses = flaggedClauses.filter(f => f.clause.isMalicious);
  const highSeverity = maliciousClauses.filter(f => f.clause.severity === 'high').length;
  const mediumSeverity = maliciousClauses.filter(f => f.clause.severity === 'medium').length;
  const lowSeverity = maliciousClauses.filter(f => f.clause.severity === 'low').length;
  
  const riskScore = Math.min(100, (highSeverity * 30) + (mediumSeverity * 15) + (lowSeverity * 5));
  
  // Generate summary
  const summary = generateSummary(keyDetails, flaggedClauses, riskScore);
  
  // Generate recommendations
  const recommendations = generateRecommendations(flaggedClauses);
  
  return {
    summary,
    keyDetails,
    flaggedClauses,
    overallRiskScore: riskScore,
    recommendations
  };
}

function generateSummary(keyDetails: KeyDetail[], flaggedClauses: FlaggedClause[], riskScore: number): string {
  const maliciousCount = flaggedClauses.filter(f => f.clause.isMalicious).length;
  const rentDetail = keyDetails.find(d => d.label === 'Monthly Rent');
  const depositDetail = keyDetails.find(d => d.label === 'Security Deposit');
  
  let summary = 'This appears to be a residential tenancy agreement for a property in British Columbia. ';
  
  if (rentDetail) {
    summary += `The monthly rent is listed as $${rentDetail.value}. `;
  }
  
  if (depositDetail) {
    summary += `A security deposit of $${depositDetail.value} is required. `;
  }
  
  if (riskScore === 0) {
    summary += 'No concerning clauses were detected in this contract. However, always read the full document carefully.';
  } else if (riskScore < 30) {
    summary += `We found ${maliciousCount} potentially concerning clause(s). These may warrant further review.`;
  } else if (riskScore < 60) {
    summary += `We identified ${maliciousCount} problematic clause(s) that may violate BC tenancy laws. We recommend seeking advice before signing.`;
  } else {
    summary += `WARNING: This contract contains ${maliciousCount} highly problematic clause(s) that likely violate BC tenancy laws. We strongly recommend consulting with a tenant rights organization before signing.`;
  }
  
  return summary;
}

function generateRecommendations(flaggedClauses: FlaggedClause[]): string[] {
  const recommendations: string[] = [];
  const maliciousClauses = flaggedClauses.filter(f => f.clause.isMalicious);
  
  if (maliciousClauses.length === 0) {
    recommendations.push('This contract appears to follow BC tenancy laws, but always read everything carefully before signing.');
    recommendations.push('Complete a thorough move-in inspection and keep a copy of the report.');
    recommendations.push('Take photos of the unit\'s condition before moving in.');
  } else {
    recommendations.push('Consider negotiating the removal of problematic clauses before signing.');
    recommendations.push('Contact the BC Residential Tenancy Branch (RTB) for free advice: 1-800-665-8779');
    recommendations.push('Consult your university\'s student legal services or tenant advocacy group.');
    
    const categories = [...new Set(maliciousClauses.map(c => c.clause.category))];
    for (const category of categories) {
      const label = categoryLabels[category];
      recommendations.push(`Pay special attention to the ${label} section of this contract.`);
    }
  }
  
  recommendations.push('Keep a signed copy of your lease in a safe place.');
  
  return recommendations.slice(0, 5);
}
