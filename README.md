# RentRelief - AI-Powered BC Rental Contract Analyzer

An intelligent contract analysis tool for BC university students to identify problematic clauses in rental agreements before signing.

## Features

- **AI-Powered Analysis**: Uses Google's Gemini AI for deep semantic understanding of rental contracts
- **BC Law Compliance**: Checks contracts against BC Residential Tenancy Act regulations
- **Smart Clause Detection**: Identifies illegal, unfair, and concerning contract terms
- **Risk Scoring**: Provides an overall risk assessment (0-100 scale)
- **Actionable Recommendations**: Offers specific advice based on flagged issues
- **Privacy-First**: All processing happens in your browser (except AI API calls)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Fast Analysis**: Results in 2-5 seconds with AI, instant fallback to pattern matching

## What It Detects

### High-Risk Violations
- Excessive security deposits (>0.5 months rent)
- Non-refundable deposits
- Illegal eviction clauses
- Waived tenant rights
- Unrestricted landlord entry
- Tenant responsible for major repairs

### Medium-Risk Issues
- Excessive late fees
- Guest restrictions
- Improper rent increase terms
- Pet deposit violations

### Informational Clauses
- Standard notice periods
- Utility responsibilities
- Subletting policies
- Pet restrictions (in strata)

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **AI Engine**: Google Gemini 1.5 Flash
- **PDF Processing**: PDF.js
- **Routing**: React Router v6
- **State Management**: React Hooks
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RentRelief
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env` file to version control!

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5500`

### 5. Build for Production

```bash
npm run build
```

## How It Works

### Analysis Flow

1. **Upload**: User uploads PDF or TXT rental contract
2. **Text Extraction**: PDF.js extracts text from the document
3. **AI Analysis**: Gemini AI analyzes the contract using structured prompts
4. **Fallback**: If AI fails, falls back to keyword pattern matching
5. **Results**: Displays risk score, flagged clauses, and recommendations

### AI Prompt Engineering

The system uses a carefully crafted prompt that includes:
- BC Residential Tenancy Act knowledge base
- Specific instructions for clause identification
- JSON schema for structured responses
- Examples of legal violations

### Dual Analysis System

```typescript
// Primary: Gemini AI (semantic understanding)
try {
  const result = await analyzeContractWithGemini(text);
  return result; // AI-powered analysis
} catch (error) {
  // Fallback: Keyword matching (reliable backup)
  return analyzeContractWithKeywords(text);
}
```

## Key Components

### [`geminiService.ts`](src/lib/geminiService.ts)
- Gemini API integration
- BC RTA knowledge base
- Prompt engineering
- Response parsing and validation
- Error handling with retry logic

### [`contractAnalyzer.ts`](src/lib/contractAnalyzer.ts)
- Main analysis orchestration
- Gemini + fallback logic
- Interface definitions
- Performance tracking

### [`AnalysisResults.tsx`](src/components/AnalysisResults.tsx)
- Results visualization
- Risk score display
- AI-powered badge
- Flagged clauses accordion
- Recommendations list

## UI Features

- **AI-Powered Badge**: Shows when analysis used Gemini AI
- **Confidence Score**: Displays AI confidence level
- **Processing Time**: Shows analysis duration
- **Risk Levels**: Color-coded (green/yellow/orange/red)
- **Expandable Clauses**: Click to see detailed explanations
- **Responsive Design**: Mobile-friendly interface

## Privacy & Security

- **Client-Side Processing**: PDF parsing happens in browser
- **API Security**: Gemini API key stored in environment variables
- **No Data Storage**: Contracts are not saved or uploaded to servers
- **HTTPS Required**: Use HTTPS in production for API calls

## Cost Estimation

Using Gemini 1.5 Flash:
- **Per Analysis**: ~$0.0009 (less than 1 cent)
- **100 analyses**: ~$0.09
- **1,000 analyses**: ~$0.90
- **Free Tier**: 15 requests/minute included

## Testing

### Run Tests

```bash
npm test
```

### Test with Sample Contract

A test contract with problematic clauses is included:
```bash
# See test-contract.txt in the root directory
```

Upload this file to see how the AI identifies multiple violations.

## Troubleshooting

### "Gemini API key not configured"
- Ensure `.env` file exists with `VITE_GEMINI_API_KEY`
- Restart the dev server after adding the key

### "Analysis failed, using fallback"
- Check your internet connection
- Verify API key is valid
- Check Gemini API quota/limits
- The fallback system will still provide results

### PDF not parsing correctly
- Ensure PDF is text-based (not scanned image)
- Try converting to TXT format
- Check file size (<10MB recommended)

## Resources

- [BC Residential Tenancy Act](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01)
- [BC Residential Tenancy Branch](https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes. Always consult with legal professionals for official advice.

## Disclaimer

This tool provides informational analysis only and does not constitute legal advice. For specific legal questions, consult:
- BC Residential Tenancy Branch: 1-800-665-8779
- A qualified lawyer or legal aid service
- Your university's student legal services

## Built For

BC University Students - helping you avoid bad leases and understand your rights!
