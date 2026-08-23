// Tradução automática do título/resumo/modo de preparo via OpenRouter (IA).
//
// Histórico: tentamos primeiro o LibreTranslate (instâncias públicas passaram
// a exigir chave, espelhos comunitários fora do ar) e depois a MyMemory
// (bloqueava por IP compartilhado do Render, não resolvido nem com e-mail de
// identificação). Uma IA via chave de API evita os dois problemas.
//
// Diferente do ingredientTranslator.js (dicionário local, instantâneo, sem
// rede), aqui é tradução de frases inteiras — passa pela rede e pode falhar.
// Nesse caso, devolvemos o conteúdo original em inglês em vez de quebrar a
// receita.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-nano-9b-v2:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 45000;

const SYSTEM_PROMPT = `Você é um tradutor profissional especializado em culinária.
Traduza os campos do JSON de inglês para português do Brasil, natural e fluente,
mantendo termos de medida e quantidades. Preserve exatamente as tags HTML
(como <b> e <a>) que aparecerem no campo "summary". Responda APENAS com um
objeto JSON válido no mesmo formato recebido — sem markdown, sem comentários,
sem texto extra antes ou depois.`;

function stripCodeFence(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

// Traduz título, resumo e passos do modo de preparo numa única chamada —
// mais rápido e mais confiável do que uma requisição por frase.
async function translateRecipeContent({ title, summary, steps }) {
  const original = { title, summary, steps: steps.map((s) => s.step) };

  if (!OPENROUTER_API_KEY) {
    console.warn('[textTranslator] OPENROUTER_API_KEY não configurada — mantendo conteúdo em inglês.');
    return { title, summary, steps };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(original) },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter respondeu ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('resposta sem conteúdo');

    const translated = JSON.parse(stripCodeFence(content));

    if (!translated.title || !translated.summary || !Array.isArray(translated.steps)) {
      throw new Error('JSON traduzido com formato inesperado');
    }

    return {
      title: translated.title,
      summary: translated.summary,
      steps: steps.map((s, idx) => ({ ...s, step: translated.steps[idx] ?? s.step })),
    };
  } catch (error) {
    console.warn(`[textTranslator] Falha ao traduzir receita ("${title}"): ${error.message}`);
    return { title, summary, steps };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { translateRecipeContent };
