# FinAgent — Mutual Fund Analysis Agent

An AI-powered mutual fund recommendation engine for Indian investors. Answer a few questions about your financial goals and get personalized, data-driven mutual fund recommendations — complete with real NAV history charts pulled directly from AMFI.

![FinAgent](https://img.shields.io/badge/AI--Powered-Mutual%20Fund%20Advisor-blue?style=for-the-badge)
![India](https://img.shields.io/badge/Market-India%20🇮🇳-orange?style=for-the-badge)
![SEBI](https://img.shields.io/badge/SEBI-Guidelines%20Compliant-green?style=for-the-badge)
![AMFI](https://img.shields.io/badge/NAV%20Data-AMFI%20Live-purple?style=for-the-badge)

## Features

- **Multi-step questionnaire** — Collects investment goal, time horizon, risk tolerance, and SIP / lump sum amount
- **AI-powered analysis** — Uses GPT-5.2 to recommend 5 best-fit mutual funds from 2,400+ Indian schemes
- **Real fund recommendations** — Specific fund names from top AMCs (Mirae Asset, HDFC, Parag Parikh, Kotak, Canara Robeco, SBI, etc.)
- **Live NAV history chart** — Real daily NAV data fetched from AMFI via mfapi.in, plotted as an interactive area chart from fund inception to today
- **Historical CAGR summary** — 1Y, 3Y, 5Y and Since Inception returns displayed under each chart
- **Costs & Charges breakdown** — Expense ratio (direct plan), exit load, stamp duty, and tax treatment for each fund
- **Personalized reasoning** — Tailored explanation of why each fund suits the user's specific goal and risk profile
- **Projected corpus value** — AI-estimated future value based on investment amount and tenure
- **ELSS tax saving** — Automatically includes 80C-eligible funds when appropriate
- **SIP & Lump Sum support** — Works for both systematic and one-time investments

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Express 5 + TypeScript |
| AI | OpenAI GPT-5.2 via Replit AI Integrations |
| NAV Data | AMFI via mfapi.in (free, no API key needed) |
| API Contract | OpenAPI 3.1 + Orval codegen |
| Validation | Zod (server & client) |
| Monorepo | pnpm workspaces |

## Project Structure

```
mutual-fund-agent/
├── artifacts/
│   ├── api-server/                    # Express API server
│   │   └── src/
│   │       ├── app.ts                 # Express app (serves frontend in production)
│   │       └── routes/
│   │           └── analysis/
│   │               ├── index.ts       # AI recommendation endpoint
│   │               └── nav-enricher.ts  # AMFI NAV data fetcher
│   └── mutual-fund-agent/             # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── Home.tsx           # Landing page
│           │   └── Analysis.tsx       # Questionnaire + results
│           └── components/
│               └── analysis/
│                   └── FundCard.tsx   # Fund card with NAV chart & costs
├── lib/
│   ├── api-spec/                      # OpenAPI spec + Orval config
│   ├── api-client-react/              # Generated React Query hooks
│   ├── api-zod/                       # Generated Zod schemas
│   └── db/                            # Drizzle ORM + PostgreSQL
└── pnpm-workspace.yaml
```

## How It Works

1. **User fills the questionnaire** across 3 steps:
   - Step 1: Investment goal + time horizon (Short / Medium / Long term)
   - Step 2: Risk tolerance (Low / Moderate / High)
   - Step 3: SIP or lump sum amount + exact tenure via slider

2. **API call to `/api/analysis/recommend`** sends the investment profile to GPT-5.2

3. **AI generates 5 fund recommendations** with category, reasoning, highlights, costs, and CAGR estimates

4. **Backend enriches each fund in parallel** by:
   - Searching mfapi.in for the AMFI scheme code using a multi-query fuzzy strategy
   - Fetching complete daily NAV history and downsampling to monthly points (max 10 years)

5. **Results page displays** for each fund:
   - Interactive NAV history area chart (real AMFI data)
   - CAGR summary strip (1Y / 3Y / 5Y / Inception)
   - Why this fund fits your profile
   - Costs & Charges panel (expense ratio, exit load, stamp duty, tax treatment)
   - Min. SIP and lump sum amounts

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- OpenAI API key (or Replit AI Integrations — no key needed on Replit)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dineshvmr/mutual_fund_agent.git
cd mutual_fund_agent

# Install dependencies
pnpm install

# Set environment variables
# Add: AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, PORT
```

### Development

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 19320)
pnpm --filter @workspace/mutual-fund-agent run dev
```

Open `http://localhost:19320` in your browser.

### Production Build

```bash
# Build frontend and backend
pnpm --filter @workspace/mutual-fund-agent build
pnpm --filter @workspace/api-server build

# Start production server (serves both API and frontend)
pnpm --filter @workspace/api-server start
```

The production Express server serves the compiled React app at `/` and the API at `/api/...` from a single port.

### Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## API Reference

### `POST /api/analysis/recommend`

Analyze an investment profile and return enriched mutual fund recommendations with live NAV data.

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
  "summary": "With a 10-year horizon and moderate risk tolerance...",
  "projectedValue": "Estimated corpus of ~₹23–25 lakhs based on 12% p.a. returns",
  "recommendations": [
    {
      "name": "Parag Parikh Flexi Cap Fund - Direct Plan Growth",
      "category": "Flexi Cap",
      "amcName": "PPFAS Mutual Fund",
      "riskLevel": "moderately-high",
      "returnPotential": "11-13% p.a.",
      "whyRecommended": "...",
      "keyHighlights": ["Low expense ratio", "International diversification", "Consistent outperformer"],
      "sipMinAmount": 1000,
      "lumpSumMinAmount": 1000,
      "taxBenefit": false,
      "performance": {
        "oneYear": 18.4,
        "threeYear": 14.2,
        "fiveYear": 16.8,
        "sinceInception": 15.3,
        "inceptionYear": 2013
      },
      "costs": {
        "expenseRatio": 0.58,
        "exitLoad": "1% if redeemed within 1 year, Nil thereafter",
        "stampDuty": "0.005% on purchase",
        "taxOnReturns": "LTCG: 12.5% above ₹1.25L after 1 year; STCG: 20% within 1 year"
      },
      "schemeCode": 122639,
      "navHistory": [
        { "date": "2014-01-01", "nav": 12.45 },
        { "date": "2024-12-01", "nav": 87.32 }
      ]
    }
  ],
  "disclaimer": "Mutual fund investments are subject to market risks..."
}
```

## NAV Data Source

Real NAV data is fetched from **[mfapi.in](https://www.mfapi.in/)**, an open-source API that wraps AMFI's official daily NAV feed. No API key is required. The backend:

1. Searches for the AMFI scheme code using a multi-query fuzzy strategy (tries progressively shorter name variants)
2. Fetches the full NAV history for the matched scheme
3. Downsamples to one data point per month (up to 10 years / 120 points) before sending to the frontend

If a fund name cannot be matched, the card falls back to displaying the AI-generated CAGR bar chart.

## Disclaimer

This tool is for **informational and educational purposes only**. The recommendations are AI-generated based on user inputs and do not constitute certified financial advice. Past performance is not indicative of future returns. Please consult a SEBI-registered investment advisor before making investment decisions. Mutual fund investments are subject to market risks.

## License

MIT
