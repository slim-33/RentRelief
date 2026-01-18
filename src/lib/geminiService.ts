import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { AnalysisResult, KeyDetail, FlaggedClause } from './contractAnalyzer';
import { ClausePattern } from '@/data/bcRentalClauses';

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// BC Residential Tenancy Act Knowledge Base
const BC_RTA_KNOWLEDGE = `
BC RESIDENTIAL TENANCY ACT KEY REGULATIONS:

SECURITY DEPOSITS (Section 19):
- Maximum: 0.5 months rent (half month's rent) - THIS IS LEGAL AND COMPLIANT
- ONLY flag as excessive if deposit is MORE THAN 0.5 months rent
- Examples:
  * $2,000 rent with $1,000 deposit = COMPLIANT (exactly 0.5)
  * $2,000 rent with $1,500 deposit = VIOLATION (0.75 months)
  * $2,100 rent with $1,050 deposit = COMPLIANT (exactly 0.5)
- Must be refundable
- Requires move-in and move-out condition inspection reports
- Cannot be labeled as "non-refundable"

PET DEPOSITS (Section 19):
- Maximum: 0.5 months rent (separate from security deposit) - THIS IS LEGAL
- ONLY flag as excessive if pet deposit is MORE THAN 0.5 months rent
- Must be refundable
- Only allowed if pets are permitted

RENT INCREASES (Section 42-43):
- Frequency: Once per 12 months maximum
- Notice: 3 months written notice required
- Amount: Limited to government-set percentage (typically 2-3% annually)
- Cannot be retroactive
- Requires proper RTB form

TERMINATION & EVICTION (Section 45-55):
- Landlord must follow proper legal process
- Cannot evict without proper notice and reason
- Tenant entitled to dispute resolution
- Immediate eviction clauses are illegal
- Fixed-term vacate clauses generally unenforceable (since 2017)

NOTICE PERIODS (Section 45):
- Month-to-month: 1 month notice from tenant
- Landlord ending tenancy: 2-4 months depending on reason
- Tenants cannot waive notice rights

MAINTENANCE & REPAIRS (Section 32):
- Landlord responsible for maintaining rental unit
- Landlord must keep unit in reasonable condition
- Major repairs are landlord's responsibility
- Tenant cannot be forced to pay for structural repairs

PRIVACY & ENTRY (Section 29):
- Landlord must give 24 hours written notice before entry
- Entry only allowed 8am-9pm unless emergency
- Must specify reason for entry
- Unlimited access clauses are illegal

TENANT RIGHTS (Section 5):
- Rights under RTA cannot be waived
- Any clause attempting to waive RTA rights is void
- Tenants have right to quiet enjoyment
- Reasonable guest policies only

POST-DATED CHEQUES (Section 22):
- Landlords cannot require post-dated cheques
- Cannot require automatic payment authorization
- Tenant chooses payment method

UTILITIES:
- Must be clearly specified who pays what
- Cannot change utility responsibility without agreement
- Landlord cannot charge more than actual cost

SUBLETTING (Section 34):
- Landlord cannot unreasonably refuse subletting
- Important for students during summer breaks
- Tenant must get landlord approval
`;

/**
 * Custom error class for Gemini-related errors
 */
export class GeminiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Gemini API response structure
 */
interface GeminiAnalysisResponse {
  keyDetails: {
    monthlyRent: string | null;
    securityDeposit: string | null;
    petDeposit: string | null;
    leaseStartDate: string | null;
    leaseEndDate: string | null;
    propertyAddress: string | null;
    landlordName: string | null;
    tenantName: string | null;
    noticePeriod: string | null;
  };
  flaggedClauses: Array<{
    clauseText: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    isMalicious: boolean;
    violation: string;
    legalReference: string;
    explanation: string;
    recommendation: string;
  }>;
  overallRiskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
  recommendations: string[];
}

/**
 * Build the analysis prompt for Gemini
 */
function buildAnalysisPrompt(contractText: string): string {
  return `You are an expert legal analyst specializing in BC (British Columbia) Residential Tenancy Act compliance. Your task is to analyze rental contracts and identify problematic clauses that violate BC tenancy laws.

${BC_RTA_KNOWLEDGE}

TASK:
Analyze the following rental contract and provide a comprehensive assessment. Extract key details, identify problematic clauses, and calculate an overall risk score.

IMPORTANT INSTRUCTIONS:
1. Be thorough but concise in your analysis
2. ONLY flag clauses that VIOLATE BC law - do NOT flag compliant clauses
3. Security deposits at exactly 0.5 months rent are LEGAL and should NOT be flagged
4. Pet deposits at exactly 0.5 months rent are LEGAL and should NOT be flagged
5. Only flag deposits if they EXCEED 0.5 months rent (e.g., 0.75 months, 1 month, etc.)
6. Provide specific legal references from BC RTA
7. Calculate risk score based on severity: High=30 points, Medium=15 points, Low=5 points (max 100)
8. Provide actionable recommendations for the tenant
9. Extract exact text snippets for flagged clauses (keep under 200 characters)
10. If a contract is compliant, the flaggedClauses array should be EMPTY or contain only informational items

OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):

{
  "keyDetails": {
    "monthlyRent": "extracted value or null",
    "securityDeposit": "extracted value or null",
    "petDeposit": "extracted value or null",
    "leaseStartDate": "extracted value or null",
    "leaseEndDate": "extracted value or null",
    "propertyAddress": "extracted value or null",
    "landlordName": "extracted value or null",
    "tenantName": "extracted value or null",
    "noticePeriod": "extracted value or null"
  },
  "flaggedClauses": [
    {
      "clauseText": "exact text from contract (max 200 chars)",
      "category": "security_deposit|rent|termination|maintenance|privacy|pets|subletting|utilities|other",
      "severity": "low|medium|high",
      "isMalicious": true or false,
      "violation": "brief description of what law is violated",
      "legalReference": "BC RTA Section X",
      "explanation": "why this is concerning for the tenant",
      "recommendation": "what the tenant should do about this"
    }
  ],
  "overallRiskScore": 0-100,
  "riskLevel": "low|moderate|high|critical",
  "summary": "2-3 sentence overview of the contract",
  "recommendations": ["recommendation 1", "recommendation 2", "..."]
}

RISK LEVEL GUIDELINES:
- low: 0 score, no violations found
- moderate: 1-29 score, minor concerns
- high: 30-59 score, significant violations
- critical: 60+ score, serious illegal clauses

CONTRACT TEXT TO ANALYZE:
${contractText.slice(0, 50000)}

Remember: Respond with ONLY the JSON object, no additional text or formatting.`;
}

/**
 * Validate the Gemini response structure
 */
function validateAnalysisResult(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check required top-level fields
  if (!data.keyDetails || typeof data.keyDetails !== 'object') return false;
  if (!Array.isArray(data.flaggedClauses)) return false;
  if (typeof data.overallRiskScore !== 'number') return false;
  if (!data.riskLevel || typeof data.riskLevel !== 'string') return false;
  if (!data.summary || typeof data.summary !== 'string') return false;
  if (!Array.isArray(data.recommendations)) return false;
  
  // Validate risk score range
  if (data.overallRiskScore < 0 || data.overallRiskScore > 100) return false;
  
  // Validate risk level
  const validRiskLevels = ['low', 'moderate', 'high', 'critical'];
  if (!validRiskLevels.includes(data.riskLevel)) return false;
  
  return true;
}

/**
 * Parse and convert Gemini response to AnalysisResult format
 */
function parseGeminiResponse(response: string): AnalysisResult {
  // Remove markdown code blocks if present
  let cleanedResponse = response.trim();
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  let data: GeminiAnalysisResponse;
  try {
    data = JSON.parse(cleanedResponse);
  } catch (error) {
    throw new GeminiError('Failed to parse Gemini response as JSON', 'PARSE_ERROR');
  }
  
  // Validate structure
  if (!validateAnalysisResult(data)) {
    throw new GeminiError('Invalid response structure from Gemini', 'VALIDATION_ERROR');
  }
  
  // Convert to AnalysisResult format
  const keyDetails: KeyDetail[] = [];
  const detailsMap = data.keyDetails;
  
  if (detailsMap.propertyAddress) {
    keyDetails.push({ label: 'Property Address', value: detailsMap.propertyAddress, category: 'other' });
  }
  if (detailsMap.landlordName) {
    keyDetails.push({ label: 'Landlord Name', value: detailsMap.landlordName, category: 'other' });
  }
  if (detailsMap.monthlyRent) {
    keyDetails.push({ label: 'Monthly Rent', value: detailsMap.monthlyRent, category: 'rent' });
  }
  if (detailsMap.securityDeposit) {
    keyDetails.push({ label: 'Security Deposit', value: detailsMap.securityDeposit, category: 'security_deposit' });
  }
  if (detailsMap.petDeposit) {
    keyDetails.push({ label: 'Pet Deposit', value: detailsMap.petDeposit, category: 'security_deposit' });
  }
  if (detailsMap.leaseStartDate) {
    keyDetails.push({ label: 'Lease Start Date', value: detailsMap.leaseStartDate, category: 'termination' });
  }
  if (detailsMap.leaseEndDate) {
    keyDetails.push({ label: 'Lease End Date', value: detailsMap.leaseEndDate, category: 'termination' });
  }
  if (detailsMap.noticePeriod) {
    keyDetails.push({ label: 'Notice Period', value: detailsMap.noticePeriod, category: 'termination' });
  }
  
  // Convert flagged clauses
  const flaggedClauses: FlaggedClause[] = data.flaggedClauses.map((clause, index) => {
    const clausePattern: ClausePattern = {
      id: `gemini-${index}`,
      category: clause.category as any,
      name: clause.violation,
      description: clause.explanation,
      keywords: [],
      isMalicious: clause.isMalicious,
      severity: clause.severity,
      legalReference: clause.legalReference,
      explanation: clause.explanation
    };
    
    return {
      clause: clausePattern,
      matchedText: clause.clauseText,
      position: 0,
      aiInsight: clause.recommendation
    };
  });
  
  return {
    summary: data.summary,
    keyDetails,
    flaggedClauses,
    overallRiskScore: data.overallRiskScore,
    recommendations: data.recommendations,
    analysisMethod: 'gemini',
    confidence: 95 // Gemini is generally high confidence
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Analyze contract with Gemini AI (with retry logic)
 */
export async function analyzeContractWithGemini(
  contractText: string,
  maxRetries: number = 3
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new GeminiError('Gemini API key not configured', 'NO_API_KEY');
  }
  
  if (!contractText || contractText.trim().length < 100) {
    throw new GeminiError('Contract text too short for analysis', 'INVALID_INPUT');
  }
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });
  
  const prompt = buildAnalysisPrompt(contractText);
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      if (!text) {
        throw new GeminiError('Empty response from Gemini', 'EMPTY_RESPONSE');
      }
      
      // Parse and return the result
      return parseGeminiResponse(text);
      
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      // If it's a parsing/validation error and not the last attempt, retry
      if (error instanceof GeminiError && !isLastAttempt) {
        console.warn(`Gemini attempt ${attempt + 1} failed:`, error.message);
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff: 1s, 2s, 4s
        continue;
      }
      
      // If it's the last attempt or a different error, throw
      if (error instanceof GeminiError) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new GeminiError(
        error instanceof Error ? error.message : 'Unknown error during Gemini analysis',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw new GeminiError('Max retries exceeded', 'MAX_RETRIES');
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Create a chat session for follow-up questions about the contract
 */
export function createContractChatSession(
  contractText: string,
  analysisResult: AnalysisResult
): ChatSession {
  if (!apiKey) {
    throw new GeminiError('Gemini API key not configured', 'NO_API_KEY');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });

  // Build context for the chat
  const contextPrompt = `You are Lease-Uh, a sassy, witty assistant specializing in BC (British Columbia) rental law and tenant rights. You have just analyzed a rental contract for a tenant, and honey, you're not afraid to call out sketchy landlord behavior when you see it.

${BC_RTA_KNOWLEDGE}

CONTRACT ANALYSIS SUMMARY:
- Risk Score: ${analysisResult.overallRiskScore}%
- Summary: ${analysisResult.summary}
- Flagged Issues: ${analysisResult.flaggedClauses.length}
- Key Details: ${analysisResult.keyDetails.map(d => `${d.label}: ${d.value}`).join(', ')}

FLAGGED CLAUSES:
${analysisResult.flaggedClauses.map((fc, i) => `${i + 1}. ${fc.clause.name}: ${fc.clause.explanation}`).join('\n')}

RECOMMENDATIONS PROVIDED:
${analysisResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Your role is to:
1. Answer questions about the analyzed contract with personality and sass
2. Provide guidance on next steps for the tenant (but make it fun)
3. Explain BC rental laws in simple terms with a bit of attitude
4. Suggest actions the tenant can take (while keeping it real)
5. Clarify any concerns about specific clauses
6. Help the tenant understand their rights and options
7. Call out unfair clauses with appropriate shade

PERSONALITY GUIDELINES:
- You are Lease-Uh - occasionally remind people of your name in responses
- Be sassy but supportive - you're on the tenant's side!
- Use phrases like "Oh honey," "Listen up," "Let me tell you," "Girl/Friend," etc.
- Add a bit of humor and personality to dry legal topics
- Don't be afraid to throw shade at sketchy landlord practices
- Use emojis occasionally (but not excessively) 💅✨🚩
- Keep it professional enough but fun and engaging
- When the contract is bad, express appropriate outrage on the tenant's behalf
- When the contract is good, celebrate it!

If asked about specific legal action, still remind them to consult with a lawyer or the BC Residential Tenancy Branch for official legal advice (but do it with style).

Keep responses concise (2-4 paragraphs max) and easy to understand. Use bullet points when listing options or steps. Make legal advice actually enjoyable to read!`;

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: contextPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Hey, I\'m Lease-Uh! 💅 I\'ve read this contract and I am READY to dish! I know BC rental law like the back of my hand, and I\'m not afraid to call out the nonsense when I see it. Whether your landlord is trying to pull a fast one or this contract is actually decent (rare, but it happens!), I\'ve got your back. So spill - what do you want to know? ✨' }]
      }
    ]
  });

  return chat;
}

/**
 * Send a message in the chat session and get a response
 */
export async function sendChatMessage(
  chatSession: ChatSession,
  message: string
): Promise<string> {
  try {
    const result = await chatSession.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    throw new GeminiError(
      error instanceof Error ? error.message : 'Failed to send chat message',
      'CHAT_ERROR'
    );
  }
}
