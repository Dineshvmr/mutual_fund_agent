# FinAgent — Mutual Fund Analysis Agent

An AI-powered mutual fund recommendation engine for Indian investors. Answer a few questions about your financial goals and get personalized, data-driven mutual fund recommendations instantly.

![FinAgent](https://img.shields.io/badge/AI--Powered-Mutual%20Fund%20Advisor-blue?style=for-the-badge)
![India](https://img.shields.io/badge/Market-India%20🇮🇳-orange?style=for-the-badge)
![SEBI](https://img.shields.io/badge/SEBI-Guidelines%20Compliant-green?style=for-the-badge)

## Features

- **Multi-step questionnaire** — Collects time horizon, investment goal, risk tolerance, and investment style (SIP / lump sum)
- **AI-powered analysis** — Uses GPT-5.2 to analyze your profile and recommend 5 best-fit mutual funds from 2,400+ Indian schemes
- **Real fund recommendations** — Specific fund names from top AMCs (Mirae Asset, HDFC, Parag Parikh, Kotak, Canara Robeco, SBI, etc.)
- **Personalized reasoning** — Each fund comes with a tailored explanation of why it suits your profile
- **Projected corpus value** — Estimated future value based on your investment amount and tenure
- **ELSS tax saving** — Automatically includes 80C-eligible ELSS funds when appropriate
- **SIP & Lump Sum support** — Works for both systematic and one-time investments

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| Forms | React Hook Form + Zod |
| Backend | Express 5 + TypeScript |
| AI | OpenAI GPT-5.2 via Replit AI Integrations |
| API Contract | OpenAPI 3.1 + Orval codegen |
| Validation | Zod (server & client) |
| Monorepo | pnpm workspaces |

## Project Structure

```
mutual-fund-agent/
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/routes/
│   │       └── analysis/    # AI recommendation endpoint
│   └── mutual-fund-agent/   # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── Home.tsx       # Landing page
│           │   └── Analysis.tsx   # Questionnaire + results
│           └── components/
│               └── analysis/
│                   └── FundCard.tsx  # Fund recommendation card
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM + PostgreSQL
└── pnpm-workspace.yaml
```

## How It Works

1. **User fills the questionnaire** across 3 steps:
   - Step 1: Investment goal + time horizon (Short / Medium / Long term)
   - Step 2: Risk tolerance (Low / Moderate / High) with detailed descriptions
   - Step 3: SIP or lump sum amount + exact tenure via slider

2. **API call to `/api/analysis/recommend`** sends the investment profile

3. **AI agent analyzes the profile** using a detailed system prompt covering:
   - SEBI fund categories
   - AMC track records
   - Risk-return tradeoffs
   - Tax implications

4. **Results page displays**:
   - Personalized AI summary
   - Projected corpus value
   - 5 recommended funds with full details
   - SEBI disclaimer

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL (or use Replit's built-in DB)
- OpenAI API key (or Replit AI Integrations)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dineshvmr/mutual_fund_agent.git
cd mutual_fund_agent

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Add: DATABASE_URL, AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, PORT
```

### Development

```bash
# Start the API server (default port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (default port 19320)
pnpm --filter @workspace/mutual-fund-agent run dev
```

Then open `http://localhost:19320` in your browser.

### Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## API Reference

### `POST /api/analysis/recommend`

Analyze an investment profile and return mutual fund recommendations.

**Request body:**
```json
{
  "timeHorizon": "long",
  "goal": "Wealth Creation",
  "tenure": 10,
  "investingNature": "sip",
  "monthlyAmount": 10000,
  "riskTolerance": "moderate"
}
```

**Response:**
```json
{
  "summary": "With a 10-year horizon...",
  "projectedValue": "Estimated corpus of ~₹23–25 lakhs...",
  "recommendations": [
    {
      "name": "Parag Parikh Flexi Cap Fund - Direct Plan",
      "category": "Flexi Cap",
      "amcName": "PPFAS Mutual Fund",
      "riskLevel": "moderately-high",
      "returnPotential": "11-13% p.a.",
      "whyRecommended": "...",
      "keyHighlights": ["..."],
      "sipMinAmount": 1000,
      "lumpSumMinAmount": 1000,
      "taxBenefit": false
    }
  ],
  "disclaimer": "Mutual fund investments are subject to market risks..."
}
```

## Disclaimer

This tool is for **informational and educational purposes only**. The recommendations are AI-generated based on user inputs and do not constitute certified financial advice. Please consult a SEBI-registered investment advisor before making investment decisions. Mutual fund investments are subject to market risks.

## License

MIT
