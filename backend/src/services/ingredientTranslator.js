const PT_TO_EN = require('../data/ingredientTranslations');

// Gera o mapa reverso EN -> PT a partir do dicionário acima.
// Quando dois termos em PT levam ao mesmo EN, o primeiro encontrado "vence".
const EN_TO_PT = {};
for (const [pt, en] of Object.entries(PT_TO_EN)) {
  const key = normalizeText(en);
  if (!EN_TO_PT[key]) {
    EN_TO_PT[key] = pt;
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // remove acentos
}

/**
 * Traduz um ingrediente digitado pelo usuário (PT-BR ou já em EN) para inglês,
 * formato que a Spoonacular entende. Se não houver tradução conhecida,
 * devolve o termo original (a API ainda pode reconhecê-lo, ex.: já em inglês).
 */
function toEnglish(term) {
  const normalized = normalizeText(term);
  if (PT_TO_EN[normalized]) {
    return PT_TO_EN[normalized];
  }

  // tenta sem plural simples ("tomates" -> "tomate")
  if (normalized.endsWith('s') && PT_TO_EN[normalized.slice(0, -1)]) {
    return PT_TO_EN[normalized.slice(0, -1)];
  }

  console.warn(`[ingredientTranslator] Sem tradução conhecida para "${term}" — enviando como está.`);
  return term;
}

/**
 * Tenta trazer de volta para PT-BR um nome de ingrediente retornado pela Spoonacular
 * (sempre em inglês). Melhor esforço: troca substrings conhecidas por PT-BR;
 * o que não for reconhecido permanece em inglês.
 */
// Chaves EN de mais de uma palavra (ex.: "bell pepper"), da mais longa para a
// mais curta, para tentar casar frases inteiras antes de palavras soltas.
const MULTI_WORD_KEYS = Object.keys(EN_TO_PT)
  .filter((key) => key.includes(' '))
  .sort((a, b) => b.length - a.length);

function lookupSingleWord(word) {
  const normalized = normalizeText(word);
  if (EN_TO_PT[normalized]) return EN_TO_PT[normalized];
  // plural simples: "tomatoes" -> tenta "tomatoe"/"tomato", "chickens" -> "chicken"
  if (normalized.endsWith('es') && EN_TO_PT[normalized.slice(0, -2)]) {
    return EN_TO_PT[normalized.slice(0, -2)];
  }
  if (normalized.endsWith('s') && EN_TO_PT[normalized.slice(0, -1)]) {
    return EN_TO_PT[normalized.slice(0, -1)];
  }
  return null;
}

function toPortuguese(term) {
  const normalized = normalizeText(term);

  if (EN_TO_PT[normalized]) {
    return EN_TO_PT[normalized];
  }

  let result = term;

  // 1) frases conhecidas de mais de uma palavra
  for (const enKey of MULTI_WORD_KEYS) {
    const regex = new RegExp(`\\b${enKey}\\b`, 'i');
    if (regex.test(result)) {
      result = result.replace(regex, EN_TO_PT[enKey]);
    }
  }

  // 2) palavras soltas restantes (com suporte a plural simples)
  result = result
    .split(/(\s+)/) // preserva os espaços ao dividir
    .map((token) => {
      const clean = token.replace(/[.,;:()]/g, '');
      if (!clean) return token;
      const translated = lookupSingleWord(clean);
      return translated ? token.replace(clean, translated) : token;
    })
    .join('');

  return result;
}

module.exports = { toEnglish, toPortuguese, normalizeText };
