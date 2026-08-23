// Tradução automática do título/resumo/modo de preparo via MyMemory
// (https://mymemory.translated.net) — serviço gratuito, sem necessidade de
// chave/conta (limite generoso por IP; dá pra registrar um e-mail depois
// pra aumentar a cota, ver MYMEMORY_EMAIL abaixo).
//
// Nota: testamos o LibreTranslate primeiro, mas as instâncias públicas
// passaram a exigir chave de API e os espelhos comunitários estavam fora do
// ar no momento — por isso a escolha pela MyMemory.
//
// Diferente do ingredientTranslator.js (dicionário local, instantâneo, sem
// rede), aqui a tradução é de frases inteiras — por isso passa pela rede e
// pode falhar. Nesse caso, devolvemos o texto original em inglês em vez de
// quebrar a receita.
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL; // opcional: aumenta a cota diária
const TIMEOUT_MS = 8000;
// A API tem limite de tamanho por requisição; textos maiores que isso são
// devolvidos sem tradução em vez de arriscar um pedido que sempre falha.
const MAX_CHARS = 490;

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// A API só aceita um trecho pequeno por requisição — agrupa frases até
// chegar perto do limite, em vez de cortar o resumo pela metade.
function chunkBySentence(text, maxChars) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxChars && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

async function translateChunk(text) {
  const params = new URLSearchParams({ q: text, langpair: 'en|pt' });
  if (MYMEMORY_EMAIL) params.set('de', MYMEMORY_EMAIL);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${MYMEMORY_URL}?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MyMemory respondeu ${response.status}`);
    }

    const data = await response.json();
    const translated = data.responseData?.translatedText;

    if (!translated || data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'sem tradução na resposta');
    }

    return translated;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateText(text, { html = false } = {}) {
  if (!text) return text;

  const plain = html ? stripHtml(text) : text;
  if (!plain) return text;

  try {
    if (plain.length <= MAX_CHARS) {
      return await translateChunk(plain);
    }

    // texto longo (ex.: resumo da receita): traduz em pedaços e junta de volta
    const chunks = chunkBySentence(plain, MAX_CHARS);
    const translatedChunks = await Promise.all(chunks.map(translateChunk));
    return translatedChunks.join(' ');
  } catch (error) {
    console.warn(`[textTranslator] Falha ao traduzir ("${plain.slice(0, 40)}..."): ${error.message}`);
    return text;
  }
}

// Traduz só o essencial de uma receita (título, resumo, passos do modo de
// preparo). Os nomes de ingredientes continuam pelo dicionário local
// (ingredientTranslator.js) — instantâneo e não soma à cota do serviço
// gratuito de tradução.
async function translateRecipeContent({ title, summary, steps }) {
  const [translatedTitle, translatedSummary, translatedStepTexts] = await Promise.all([
    translateText(title),
    translateText(summary, { html: true }),
    Promise.all(steps.map((s) => translateText(s.step))),
  ]);

  return {
    title: translatedTitle,
    summary: translatedSummary,
    steps: steps.map((s, idx) => ({ ...s, step: translatedStepTexts[idx] })),
  };
}

module.exports = { translateText, translateRecipeContent };
