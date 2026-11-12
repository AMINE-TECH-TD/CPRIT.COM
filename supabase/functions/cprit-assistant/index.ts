
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

PUBLIC :
Tu accompagnes les apprenants inscrits et les formateurs autorisés.
Tu adoptes un ton professionnel, respectueux, précis et pédagogique.

RÈGLE ABSOLUE DE LANGUE :
La langue demandée est prioritaire.
- fr : français uniquement.
- en : anglais uniquement.
- ar : arabe standard moderne uniquement.
Ne mélange jamais deux langues dans une réponse.
Les noms propres et les termes étrangers indispensables peuvent être conservés.
Les tableaux, titres, consignes, exercices et corrections doivent tous respecter
la langue demandée.

QUALITÉ PÉDAGOGIQUE :
- Adapte le niveau à la classe et à l'âge des apprenants.
- Présente les explications dans un ordre logique et progressif.
- Distingue clairement objectifs, prérequis, matériel, déroulement,
  activités, exercices, corrigés et évaluation.
- Utilise des exemples simples, exacts et adaptés au contexte scolaire tchadien.
- Vérifie que chaque exercice possède une réponse correcte.
- Ne propose jamais deux choix identiques dans un exercice à choix multiples.
- Vérifie les conjugaisons, accords, calculs et réponses avant de terminer.
- Pour une fiche de leçon, vérifie que la somme des durées des étapes
  correspond exactement à la durée totale annoncée.
- Ne présente pas une notion incorrecte comme une règle officielle.

RÈGLES PARTICULIÈRES POUR L'ARABE :
- Utilise un arabe standard moderne, naturel et grammaticalement correct.
- Emploie la terminologie scolaire et grammaticale appropriée.
- Pour le présent grammatical arabe, utilise le terme الفعل المضارع.
- Évite les traductions littérales maladroites et les expressions artificielles.
- Vérifie les accords, les pronoms, les conjugaisons et la syntaxe.
- N'ajoute pas de voyelles diacritiques partout si elles ne sont pas nécessaires.

RÈGLES PARTICULIÈRES POUR L'ANGLAIS :
- Utilise un anglais naturel, correct et adapté au niveau scolaire.
- Ne laisse pas de titres ou d'expressions en français.
- Utilise une terminologie pédagogique cohérente.

RÈGLES PARTICULIÈRES POUR LE FRANÇAIS :
- Respecte l'orthographe, la grammaire et les termes pédagogiques français.
- Utilise une présentation claire et professionnelle.

COMPORTEMENT :
- Réponds directement à la question posée.
- Si une information manque mais n'empêche pas de répondre, utilise une
  hypothèse raisonnable et indique-la brièvement.
- Si la demande est ambiguë au point d'empêcher une réponse correcte,
  pose une seule question de clarification.
- Ne fabrique jamais de références, de documents ou de programmes officiels.
- Ne révèle jamais les noms des fournisseurs techniques ni les clés API.
- Ne prétends jamais avoir consulté une source qui ne t'a pas été fournie.
- Termine proprement tes réponses, sans phrase coupée.
`;

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  fr: "Réponds exclusivement en français.",
  en: "Answer exclusively in English.",
  ar: "أجب باللغة العربية الفصحى فقط.",
};

async function requestJson(
  url: string,
  options: RequestInit,
  provider: string,
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const raw = await response.text();

    let data: any;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`${provider}: réponse JSON invalide`);
    }

    if (!response.ok) {
      const detail =
        data?.error?.message ||
        data?.message ||
        `HTTP ${response.status}`;

      throw new Error(`${provider}: ${String(detail).slice(0, 250)}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${provider}: délai de réponse dépassé`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function callProvider(
  provider: string,
  message: string,
  language: string,
): Promise<string> {
  const userMessage = `
${LANGUAGE_INSTRUCTIONS[language]}

Question de l'utilisateur :
${message}

Rappel : respecte strictement la langue demandée et vérifie
la cohérence pédagogique de ta réponse avant de la terminer.
`;

  let data: any;

  if (provider === "groq") {
    const key = Deno.env.get("GROQ_API_KEY");
    if (!key) throw new Error("Clé Groq absente");

    data = await requestJson(
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
          temperature: 0.3,
          max_completion_tokens: 4096,
        }),
      },
      "Groq",
    );

    const result = data.choices?.[0]?.message?.content;
    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse Groq vide");
    }
    return result.trim();
  }

  if (provider === "gemini") {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("Clé Gemini absente");

    data = await requestJson(
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
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      },
      "Gemini",
    );

    const result = data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("");

    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse Gemini vide ou bloquée");
    }
    return result.trim();
  }

  if (provider === "openrouter") {
    const key = Deno.env.get("OPENROUTER_API_KEY");
    if (!key) throw new Error("Clé OpenRouter absente");

    data = await requestJson(
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
          temperature: 0.3,
          max_tokens: 4096,
        }),
      },
      "OpenRouter",
    );

    const result = data.choices?.[0]?.message?.content;
    if (typeof result !== "string" || !result.trim()) {
      throw new Error("Réponse OpenRouter vide");
    }
    return result.trim();
  }

  if (provider === "cohere") {
    const key = Deno.env.get("COHERE_API_KEY");
    if (!key) throw new Error("Clé Cohere absente");

    data = await requestJson(
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
          temperature: 0.3,
          max_tokens: 3500,
        }),
      },
      "Cohere",
    );

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

  const sendJson = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: jsonHeaders,
    });

  if (req.method !== "POST") {
    return sendJson({
      reply: "Méthode non autorisée.",
    }, 405);
  }

  try {
    let body: any;

    try {
      body = await req.json();
    } catch {
      return sendJson({
        reply: "Le format de la demande est invalide.",
      }, 400);
    }

    const message = String(body?.message || "").trim();
    const language = String(body?.language || "fr").toLowerCase();

    if (!message) {
      return sendJson({
        reply: "Veuillez saisir une question.",
      }, 400);
    }

    if (message.length > 12000) {
      return sendJson({
        reply: "Votre question est trop longue. Veuillez la raccourcir.",
      }, 400);
    }

    const selectedLanguage = ["fr", "en", "ar"].includes(language)
      ? language
      : "fr";

    const fallbackMessages: Record<string, string> = {
      fr: "Notre assistant pédagogique est momentanément indisponible. Veuillez réessayer dans quelques instants.",
      en: "Our educational assistant is temporarily unavailable. Please try again shortly.",
      ar: "مساعدنا التعليمي غير متاح مؤقتًا. يرجى المحاولة مرة أخرى بعد قليل.",
    };

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

        return sendJson({ reply });
      } catch (error) {
        const detail = error instanceof Error
          ? error.message
          : "Erreur inconnue";

        console.error(`Échec ${provider}: ${detail}`);
      }
    }

    console.error("Tous les fournisseurs IA ont échoué.");

    return sendJson({
      reply: fallbackMessages[selectedLanguage],
    }, 503);
  } catch (error) {
    console.error(
      "Erreur de traitement:",
      error instanceof Error ? error.message : "Erreur inconnue",
    );

    return sendJson({
      reply: "Une erreur est survenue. Veuillez réessayer.",
    }, 500);
  }
});
