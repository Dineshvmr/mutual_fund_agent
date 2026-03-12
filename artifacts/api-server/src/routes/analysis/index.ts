import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetRecommendationsBody } from "@workspace/api-zod";

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

    const systemPrompt = `You are an expert mutual fund advisor specializing in Indian mutual funds. Your role is to analyze an investor's profile and provide highly personalized, data-driven mutual fund recommendations based on their specific goals, risk tolerance, time horizon, and investment style.

You have deep knowledge of:
- SEBI-categorized mutual funds in India
- Top AMCs: Mirae Asset, HDFC, SBI, Axis, Kotak, DSP, ICICI Prudential, Nippon India, Parag Parikh, Canara Robeco, UTI, Motilal Oswal, Franklin Templeton, Edelweiss, Tata, etc.
- Fund categories: Large Cap, Mid Cap, Small Cap, Flexi Cap, Multi Cap, ELSS, Hybrid, Balanced Advantage, Debt (Liquid, Ultra Short, Short Duration, Corporate Bond, Gilt), Index Funds, International Funds
- Current market conditions as of early 2026

Always provide specific real fund names (not generic). Include accurate minimum investment amounts. Be factual and helpful.`;

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
  "projectedValue": "<realistic projected value based on typical returns for their profile, e.g. 'Estimated corpus of ₹X lakhs in Y years based on 12% p.a. returns'>",
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
      "taxBenefit": <true if 80C ELSS, false otherwise>
    }
  ],
  "disclaimer": "Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future returns. This is for informational purposes only and not financial advice. Please consult a SEBI-registered financial advisor before making investment decisions."
}

Recommend exactly 5 funds that best match this profile. Order them from best match to good alternatives. Ensure diversity across fund categories appropriate to the investor's risk and goal. For ${profile.riskTolerance} risk and ${profile.tenure} year tenure, choose appropriate fund types. If the goal is tax saving or tenure >= 3 years and risk is moderate/high, include at least one ELSS fund.

Respond with ONLY the JSON, no markdown, no explanation outside the JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4000,
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

    let parsed: unknown;
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
