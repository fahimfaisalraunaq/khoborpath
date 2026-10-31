// Cloudflare Worker: secure Gemini proxy for Khoborpath quizzes.
// Secrets/vars (set in Cloudflare dashboard, never in code):
//   GEMINI_API_KEY  (secret)
//   ALLOWED_ORIGIN  (e.g. https://khoborpath.pages.dev)
//   GEMINI_MODEL    (optional, default gemini-2.5-flash)

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "";
    const cors = {
      "Access-Control-Allow-Origin": origin === allowed ? origin : allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);
    if (!allowed || origin !== allowed) return json({ error: "Origin not allowed" }, 403);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const title = String(body.title || "").slice(0, 300);
    const summary = String(body.ai_summary || body.summary || "").slice(0, 2500);
    const facts = (Array.isArray(body.key_facts) ? body.key_facts : []).slice(0, 8).map((f) => String(f).slice(0, 300));
    if (!title && !summary) return json({ error: "Nothing to generate from" }, 400);

    const prompt =
      "Create 5 multiple-choice questions in the style of the Bangladesh BCS preliminary exam, based ONLY on the article below. " +
      "Each question has exactly 4 plausible options (distractors must be realistic, not absurd) and one correct answer. " +
      'Return JSON: {"questions":[{"q":string,"options":[4 strings],"answerIndex":0-3,"explanation":string}]}. ' +
      "Randomize the position of the correct answer.\n\n" +
      `Title: ${title}\nSummary: ${summary}\nKey facts:\n- ${facts.join("\n- ")}`;

    const model = env.GEMINI_MODEL || "gemini-2.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
      }),
    });
    if (!res.ok) return json({ error: "Upstream AI error", status: res.status }, 502);

    try {
      const data = await res.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      const qs = (parsed.questions || []).filter(
        (q) => typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 &&
               Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4
      );
      if (qs.length < 3) return json({ error: "Bad AI output" }, 502);
      return json({ questions: qs.slice(0, 5) });
    } catch {
      return json({ error: "Could not parse AI output" }, 502);
    }
  },
};
