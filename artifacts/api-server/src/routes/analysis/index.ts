import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetRecommendationsBody } from "@workspace/api-zod";
import { enrichFundWithNavData } from "./nav-enricher.js";

const router: IRouter = Router();

router.post("/recommend", async (req: Request, res: Response) => {
  try {
    const parseResult = GetRecommendationsBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: parseResult.error.message,
      });
      return;
    }

    const profile = parseResult.data;

    const timeHorizonLabel =
      profile.timeHorizon === "short"
        ? "Short-term (less than 3 years)"
        : profile.timeHorizon === "medium"
          ? "Medium-term (3-7 years)"
          : "Long-term (more than 7 years)";

    const investingType =
      profile.investingNature === "sip"
        ? `SIP (Systematic Investment Plan) of ₹${profile.monthlyAmount?.toLocaleString("en-IN") ?? "N/A"} per month`
        : `One-time lump sum of ₹${profile.lumpSumAmount?.toLocaleString("en-IN") ?? "N/A"}`;

    const systemPrompt = `You are an expert mutual fund advisor specializing in Indian mutual funds. Your role is to analyze an investor's profile and provide highly personalized, data-driven mutual fund recommendations.

You have deep knowledge of:
- SEBI-categorized mutual funds in India
- Top AMCs: Mirae Asset, HDFC, SBI, Axis, Kotak, DSP, ICICI Prudential, Nippon India, Parag Parikh, Canara Robeco, UTI, Motilal Oswal, Franklin Templeton, Edelweiss, Tata, etc.
- Fund categories: Large Cap, Mid Cap, Small Cap, Flexi Cap, Multi Cap, ELSS, Hybrid, Balanced Advantage, Debt, Index Funds, International Funds
- Accurate historical performance data (trailing returns as of early 2026) for all major Indian funds
- Expense ratios (direct plans), exit loads, tax treatment, and cost structures
- Current market conditions as of early 2026

Always provide specific real fund names with realistic historical performance figures. Be factual about costs.`;

    const userPrompt = `Analyze this investor profile and provide mutual fund recommendations:

**Investment Profile:**
- Time Horizon: ${timeHorizonLabel}
- Specific Tenure: ${profile.tenure} years
- Investment Goal: ${profile.goal}
- Nature of Investing: ${investingType}
- Risk Tolerance: ${profile.riskTolerance.charAt(0).toUpperCase() + profile.riskTolerance.slice(1)}

**Your task:** Provide a JSON response with the following exact structure:

{
  "summary": "<2-3 sentence personalized analysis of their investment profile and strategy>",
  "projectedValue": "<realistic projected value based on typical returns for their profile>",
  "recommendations": [
    {
      "name": "<Exact fund name>",
      "category": "<Fund category>",
      "amcName": "<AMC name>",
      "riskLevel": "<low|moderate|moderately-high|high|very-high>",
      "returnPotential": "<Expected return range, e.g. '10-12% p.a.'>",
      "whyRecommended": "<1-2 sentence personalized explanation tailored to this investor's specific goal and profile>",
      "keyHighlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
      "sipMinAmount": <minimum SIP in INR, number>,
      "lumpSumMinAmount": <minimum lump sum in INR, number>,
      "taxBenefit": <true if 80C ELSS, false otherwise>,
      "performance": {
        "oneYear": <1-year trailing return as a percentage number, e.g. 18.4>,
        "threeYear": <3-year CAGR as a percentage number, e.g. 14.2>,
        "fiveYear": <5-year CAGR as a percentage number, e.g. 16.8>,
        "sinceInception": <since inception CAGR as a percentage number, e.g. 15.3>,
        "inceptionYear": <year fund was launched, e.g. 2013>
      },
      "costs": {
        "expenseRatio": <annual expense ratio for direct plan as a percentage number, e.g. 0.58>,
        "exitLoad": "<exit load details, e.g. '1% if redeemed within 1 year, Nil thereafter'>",
        "stampDuty": "<stamp duty, e.g. '0.005% on purchase'>",
        "taxOnReturns": "<tax treatment, e.g. 'LTCG: 12.5% above ₹1.25L after 1 year; STCG: 20% within 1 year'>"
      }
    }
  ],
  "disclaimer": "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future returns. This is for informational purposes only and not financial advice. Please consult a SEBI-registered financial advisor before making investment decisions."
}

Recommend exactly 5 funds that best match this profile. Order them from best match to good alternatives. Ensure diversity across fund categories appropriate to the investor's risk and goal. For ${profile.riskTolerance} risk and ${profile.tenure} year tenure, choose appropriate fund types. If tenure >= 3 years and risk is moderate/high, include at least one ELSS fund.

Use realistic performance numbers based on actual fund data as of early 2026. Direct plan expense ratios are typically 0.1%-1.2% for equity, 0.1%-0.5% for debt.

Respond with ONLY the JSON, no markdown, no explanation outside the JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 6000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({
        error: "AI_ERROR",
        message: "No response from AI model",
      });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      res.status(500).json({
        error: "PARSE_ERROR",
        message: "Failed to parse AI response",
      });
      return;
    }

    // Enrich each fund with real AMFI NAV history in parallel
    if (Array.isArray(parsed.recommendations)) {
      console.log(`Fetching NAV data for ${parsed.recommendations.length} funds from AMFI...`);
      parsed.recommendations = await Promise.all(
        (parsed.recommendations as Record<string, unknown>[]).map((fund) =>
          enrichFundWithNavData(fund)
        )
      );
      console.log("NAV enrichment complete.");
    }

    res.json(parsed);
  } catch (error) {
    console.error("Analysis route error:", error);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
