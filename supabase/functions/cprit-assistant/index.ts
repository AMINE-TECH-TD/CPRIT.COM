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

RÈGLE DE LANGUE :
- fr : réponds exclusivement en français.
- en : réponds exclusivement en anglais.
- ar : réponds exclusivement en arabe.
Respecte toujours la langue demandée.

Tu peux répondre aux questions pédagogiques et générales.
Pour les questions liées aux cours, donne des explications
claires, structurées et adaptées au niveau de l'apprenant.

Ne révèle jamais le nom des fournisseurs techniques utilisés.
`;

async function callProvider(
  provider: string,
  message: string,
  language: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    let response: Response;
    let data: any;

    const prompt = `${SYSTEM_PROMPT}\n\nLangue demandée : ${language}\n\nQuestion : ${message}`;

    if (provider === "grok") {
      const key =
        Deno.env.get("XAI_API_KEY") ||
        Deno.env.get("GROK_API_KEY");

      if (!key) throw new Error("Grok indisponible");

      response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-4.7",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Grok indisponible");

      data = await response.json();
      const result = data.choices?.[0]?.message?.content;
      if (typeof result !== "string" || !result.trim()) {
        throw new Error("Réponse Grok vide");
      }
      return result.trim();
    }

    if (provider === "gemini") {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) throw new Error("Gemini indisponible");

      response = await fetch(
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
              parts: [{
                text: `Langue demandée : ${language}\n\n${message}`,
              }],
            }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 4000,
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) throw new Error("Gemini indisponible");

      data = await response.json();
      const result = data.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("");

      if (typeof result !== "string" || !result.trim()) {
        throw new Error("Réponse Gemini vide");
      }
      return result.trim();
    }

    if (provider === "mistral") {
      const key = Deno.env.get("MISTRAL_API_KEY");
      if (!key) throw new Error("Mistral indisponible");

      response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Langue demandée : ${language}\n\n${message}`,
              },
            ],
            temperature: 0.4,
            max_tokens: 4000,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) throw new Error("Mistral indisponible");

      data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (typeof result !== "string" || !result.trim()) {
        throw new Error("Réponse Mistral vide");
      }
      return result.trim();
    }

    throw new Error("Fournisseur inconnu");
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const language = String(body.language || "fr").toLowerCase();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Veuillez saisir une question." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const selectedLanguage = ["fr", "en", "ar"].includes(language)
      ? language
      : "fr";

    const providers = ["grok", "gemini", "mistral"];

    for (const provider of providers) {
      try {
        const reply = await callProvider(
          provider,
          message,
          selectedLanguage,
        );

        return new Response(
          JSON.stringify({ reply }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      } catch (error) {
        console.error(`${provider} : échec`, error);
      }
    }

    const fallbackMessages: Record<string, string> = {
      fr: "Le service d'assistance est momentanément indisponible. Veuillez réessayer dans quelques instants.",
      en: "The assistance service is temporarily unavailable. Please try again shortly.",
      ar: "خدمة المساعدة غير متاحة مؤقتًا. يرجى المحاولة مرة أخرى بعد قليل.",
    };

    return new Response(
      JSON.stringify({ reply: fallbackMessages[selectedLanguage] }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Erreur de traitement", error);

    return new Response(
      JSON.stringify({
        error: "Erreur lors du traitement de la demande.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
