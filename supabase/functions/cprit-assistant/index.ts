
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `
Tu es l'assistant pédagogique officiel du CPRIT,
Centre pédagogique régional de l'ICESCO au Tchad.

Tu aides les apprenants inscrits et les formateurs autorisés.
Tu réponds avec précision, pédagogie, respect et professionnalisme.

LANGUES :
- fr : réponds exclusivement en français.
- en : réponds exclusivement en anglais.
- ar : réponds exclusivement en arabe.

Respecte toujours la langue demandée.
Explique les notions avec des exemples adaptés aux apprenants.
Structure les leçons, exercices et corrections clairement.
Ne révèle jamais les noms des fournisseurs techniques.
Ne prétends pas avoir consulté un document ou une source
qui ne t'a pas été fournie.
`;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function callProvider(
  provider: string,
  message: string,
  language: string,
): Promise<string> {
  let response: Response;
  let data: any;

  const userMessage =
    `Langue demandée : ${language}\n\nQuestion : ${message}`;

  if (provider === "groq") {
    const key = Deno.env.get("GROQ_API_KEY");
    if (!key) throw new Error("Clé Groq absente");

    response = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.4,
          max_completion_tokens: 3000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}`);
    }

    data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse Groq vide");
    }

    return result.trim();
  }

  if (provider === "gemini") {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("Clé Gemini absente");

    response = await fetchWithTimeout(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [{
            role: "user",
            parts: [{ text: userMessage }],
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 3000,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    data = await response.json();

    const result = data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("");

    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse Gemini vide");
    }

    return result.trim();
  }

  if (provider === "openrouter") {
    const key = Deno.env.get("OPENROUTER_API_KEY");
    if (!key) throw new Error("Clé OpenRouter absente");

    response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Title": "CPRIT Formation",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.4,
          max_tokens: 3000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse OpenRouter vide");
    }

    return result.trim();
  }

  if (provider === "cohere") {
    const key = Deno.env.get("COHERE_API_KEY");
    if (!key) throw new Error("Clé Cohere absente");

    response = await fetchWithTimeout(
      "https://api.cohere.com/v2/chat",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command-r7b-12-2024",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.4,
          max_tokens: 3000,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Cohere HTTP ${response.status}`);
    }

    data = await response.json();

    const result = data.message?.content
      ?.filter((part: any) => part.type === "text")
      ?.map((part: any) => part.text)
      ?.join("");

    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse Cohere vide");
    }

    return result.trim();
  }

  throw new Error("Fournisseur inconnu");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const jsonHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée" }),
      { status: 405, headers: jsonHeaders },
    );
  }

  try {
    const body = await req.json();

    const message = String(body.message || "").trim();
    const language = String(body.language || "fr").toLowerCase();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Veuillez saisir une question." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    if (message.length > 12000) {
      return new Response(
        JSON.stringify({ error: "Votre question est trop longue." }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const selectedLanguage = ["fr", "en", "ar"].includes(language)
      ? language
      : "fr";

    const providers = [
      "groq",
      "gemini",
      "openrouter",
      "cohere",
    ];

    for (const provider of providers) {
      try {
        const reply = await callProvider(
          provider,
          message,
          selectedLanguage,
        );

        console.log(`Réponse obtenue : ${provider}`);

        return new Response(
          JSON.stringify({ reply }),
          { status: 200, headers: jsonHeaders },
        );
      } catch (error) {
        console.error(
          `Échec du fournisseur ${provider}:`,
          error instanceof Error ? error.message : "Erreur inconnue",
        );
      }
    }

    const fallbackMessages: Record<string, string> = {
      fr: "Notre assistant pédagogique est momentanément indisponible. Veuillez réessayer dans quelques instants.",
      en: "Our educational assistant is temporarily unavailable. Please try again shortly.",
      ar: "مساعدنا التعليمي غير متاح مؤقتًا. يرجى المحاولة مرة أخرى بعد قليل.",
    };

    return new Response(
      JSON.stringify({
        reply: fallbackMessages[selectedLanguage],
      }),
      { status: 503, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("Erreur de traitement:", error);

    return new Response(
      JSON.stringify({
        error: "Une erreur est survenue lors du traitement.",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
