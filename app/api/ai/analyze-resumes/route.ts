import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';

// Ensure IPv4 resolution on systems with broken IPv6 routes
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in environments where not supported
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { opening, candidates } = body;

    if (!opening || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { error: 'Opening details and at least one candidate are required' },
        { status: 400 }
      );
    }

    const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const fallbackModel = process.env.GROQ_FALLBACK_MODEL || 'openai/gpt-oss-20b';

    const promptPayload = {
      roleTitle: opening.title,
      department: opening.department,
      experienceRequired: opening.experienceRange ? `${opening.experienceRange.min}-${opening.experienceRange.max} years` : 'Not specified',
      budgetRange: opening.budgetRange ? `₹${opening.budgetRange.min}L - ₹${opening.budgetRange.max}L` : 'Not specified',
      mustHaveSkills: opening.mustHaveSkills || [],
      niceToHaveSkills: opening.niceToHaveSkills || [],
      description: opening.description || '',
      candidates: candidates.map((c: any) => ({
        id: c.id,
        name: c.name,
        currentRole: c.currentRole,
        currentCompany: c.currentCompany,
        experienceYears: c.experienceYears,
        noticePeriod: c.noticePeriod,
        expectedCtc: c.expectedCtc ? `₹${c.expectedCtc} LPA` : 'Not specified',
        source: c.source,
        hrNotes: c.hrNotes || 'No notes provided',
      })),
    };

    const systemPrompt = `You are an elite Director of Talent and Technical Hiring Manager AI.
Analyze the provided shortlisted candidate profiles against the requisition requirements.
Evaluate their fit, technical strengths, potential risks/gaps, and formulate tailored interview questions.

Return ONLY a valid JSON object without markdown formatting, code fences (\`\`\`), or extra commentary.
The JSON must adhere to this exact structure:
{
  "executiveSummary": "A concise, executive-level summary comparing the cohort, highlighting who the strongest pick is and why.",
  "recommendedCandidateId": "ID of the absolute best candidate",
  "candidates": [
    {
      "id": "candidate ID matching input",
      "name": "Candidate full name",
      "verdict": "Strong Hire" | "Hire" | "Borderline" | "Do Not Hire",
      "fitScore": 85, // integer 0-100
      "summary": "1-2 sentence executive verdict",
      "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
      "gaps": ["Potential risk/gap 1", "Potential risk/gap 2"],
      "interviewQuestions": [
        "Tailored technical interview question 1",
        "Tailored architecture/system question 2",
        "Probing question on their gap or challenge 3"
      ]
    }
  ]
}`;

    async function callGroq(model: string) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(promptPayload) },
          ],
          max_tokens: 2500,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      return response.json();
    }

    let completion;
    let modelUsed = primaryModel;

    try {
      completion = await callGroq(primaryModel);
    } catch (err: any) {
      console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, err.message);
      modelUsed = fallbackModel;
      completion = await callGroq(fallbackModel);
    }

    const rawContent = completion.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean any markdown code blocks if present
    let jsonText = rawContent;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      modelUsed,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/analyze-resumes:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze candidate resumes' },
      { status: 500 }
    );
  }
}

