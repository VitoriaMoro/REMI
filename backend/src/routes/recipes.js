const express = require('express');
const { findByIngredients, complexSearch, getRecipeInformation } = require('../services/spoonacular');
const { toEnglish, toPortuguese } = require('../services/ingredientTranslator');
const { computeDifficulty } = require('../services/difficulty');
const { toFriendlyMessage } = require('../services/friendlyError');
const { getCache, setCache } = require('../services/cache');
const filterOptions = require('../data/filterOptions');

const router = express.Router();

// O conteúdo de uma receita quase não muda; cache mais longo.
const RECIPE_DETAIL_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas
// Resultado de busca pode ficar um pouco mais "vivo" sem custar muitas chamadas.
const SEARCH_TTL_MS = 10 * 60 * 1000; // 10 minutos

function buildInterpretedIngredients(originalList, translatedList) {
  return originalList.map((original, idx) => ({
    original,
    searchedAs: translatedList[idx],
  }));
}

// Caminho simples: usado quando nenhum filtro extra foi pedido.
// findByIngredients já devolve usedIngredientCount/missedIngredientCount prontos.
async function searchWithoutFilters(translatedIngredients) {
  const results = await findByIngredients({ ingredients: translatedIngredients });

  return results.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    usedIngredientCount: recipe.usedIngredientCount,
    missedIngredientCount: recipe.missedIngredientCount,
    usedIngredients: recipe.usedIngredients.map((i) => toPortuguese(i.name)),
    missedIngredients: recipe.missedIngredients.map((i) => toPortuguese(i.name)),
    matchScore: Math.round(
      (recipe.usedIngredientCount / (recipe.usedIngredientCount + recipe.missedIngredientCount)) * 100
    ),
    readyInMinutes: recipe.readyInMinutes,
    // findByIngredients não devolve passos; dificuldade fica só por tempo aqui
    difficulty: computeDifficulty(recipe.readyInMinutes, null),
  }));
}

// Caminho com filtros: usa complexSearch (país, dieta, intolerância, tempo) e
// calcula o match de ingredientes manualmente, já que esse endpoint não
// devolve usedIngredientCount/missedIngredientCount como o findByIngredients.
async function searchWithFilters({ translatedIngredients, cuisine, diet, intolerances, tempo, dificuldade }) {
  const timeRange = filterOptions.timeRanges.find((t) => t.value === tempo);
  // para "rápido"/"médio" já filtramos direto na API (maxReadyTime ajuda a
  // reduzir o resultado); para "demorado" não há limite superior a enviar
  let maxReadyTimeForApi = timeRange && timeRange.value !== 'demorado' ? timeRange.max : undefined;

  // dificuldade "fácil" exige readyInMinutes <= 20 — usamos isso como dica
  // pra API mesmo sem filtro de tempo explícito, senão o lote de candidatas
  // dificilmente sobra algum "fácil" depois do filtro local.
  if (dificuldade === 'facil') {
    maxReadyTimeForApi = maxReadyTimeForApi ? Math.min(maxReadyTimeForApi, 20) : 20;
  }

  const results = await complexSearch({
    includeIngredients: translatedIngredients,
    cuisine,
    diet,
    intolerances,
    maxReadyTime: maxReadyTimeForApi,
    number: 50,
  });

  const userIngredientsLower = translatedIngredients.map((i) => i.toLowerCase());

  let recipes = results.map((recipe) => {
    const extendedIngredients = recipe.extendedIngredients || [];
    const total = extendedIngredients.length || 1;

    const matched = extendedIngredients.filter((ing) => {
      const name = (ing.name || ing.originalName || '').toLowerCase();
      return userIngredientsLower.some((u) => name.includes(u) || u.includes(name));
    });
    const missed = extendedIngredients.filter((ing) => !matched.includes(ing));

    const steps = recipe.analyzedInstructions?.[0]?.steps || [];

    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredientCount: matched.length,
      missedIngredientCount: missed.length,
      usedIngredients: matched.map((i) => toPortuguese(i.name)),
      missedIngredients: missed.map((i) => toPortuguese(i.name)),
      matchScore: Math.round((matched.length / total) * 100),
      readyInMinutes: recipe.readyInMinutes,
      difficulty: computeDifficulty(recipe.readyInMinutes, steps.length),
    };
  });

  // filtro de tempo por faixa exata (a API só garante um teto, não um piso)
  if (timeRange) {
    recipes = recipes.filter(
      (r) => (r.readyInMinutes ?? 0) >= timeRange.min && (r.readyInMinutes ?? 0) <= timeRange.max
    );
  }

  // dificuldade não existe na API — filtro 100% local
  if (dificuldade) {
    recipes = recipes.filter((r) => r.difficulty === dificuldade);
  }

  return recipes;
}

// GET /api/recipes/by-ingredients?ingredients=frango,tomate,arroz&cuisine=Italian&diet=vegan&intolerances=dairy,gluten&tempo=rapido&dificuldade=facil
router.get('/by-ingredients', async (req, res) => {
  try {
    const { ingredients, cuisine, diet, intolerances, tempo, dificuldade } = req.query;

    if (!ingredients || !ingredients.trim()) {
      return res.status(400).json({ error: 'Informe ao menos um ingrediente em "ingredients".' });
    }

    const ingredientList = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    // A Spoonacular é uma API em inglês: traduzimos o que o usuário digitou
    // (ex.: "frango, tomate, arroz" -> "chicken, tomato, rice") antes de buscar.
    const translatedIngredients = ingredientList.map(toEnglish);

    const hasFilters = Boolean(cuisine || diet || intolerances || tempo || dificuldade);

    const cacheKey = `search:${JSON.stringify({
      ingredients: translatedIngredients,
      cuisine: cuisine || '',
      diet: diet || '',
      intolerances: intolerances || '',
      tempo: tempo || '',
      dificuldade: dificuldade || '',
    })}`;

    let recipes = getCache(cacheKey);

    if (!recipes) {
      recipes = hasFilters
        ? await searchWithFilters({ translatedIngredients, cuisine, diet, intolerances, tempo, dificuldade })
        : await searchWithoutFilters(translatedIngredients);

      // Ordena pela maior compatibilidade com os ingredientes do usuário
      recipes.sort((a, b) => b.matchScore - a.matchScore);
      setCache(cacheKey, recipes, SEARCH_TTL_MS);
    }

    // Mostra ao usuário como cada ingrediente foi interpretado, útil quando
    // a tradução automática não reconhece o termo digitado.
    const interpretedIngredients = buildInterpretedIngredients(ingredientList, translatedIngredients);

    res.json({ count: recipes.length, recipes, interpretedIngredients });
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: toFriendlyMessage(error) });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `detail:${id}`;

    let payload = getCache(cacheKey);

    if (!payload) {
      const recipe = await getRecipeInformation(id);
      const steps = recipe.analyzedInstructions?.[0]?.steps || [];

      payload = {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
        summary: recipe.summary,
        difficulty: computeDifficulty(recipe.readyInMinutes, steps.length),
        ingredients: (recipe.extendedIngredients || []).map((i) => ({
          name: toPortuguese(i.name),
          amount: i.amount,
          unit: i.unit,
          // melhor esforço: troca palavras conhecidas por PT-BR, o resto do
          // texto (medidas, observações) permanece em inglês
          original: toPortuguese(i.original),
        })),
        steps: steps.map((s) => ({
          number: s.number,
          step: s.step,
        })),
      };

      setCache(cacheKey, payload, RECIPE_DETAIL_TTL_MS);
    }

    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: toFriendlyMessage(error) });
  }
});

module.exports = router;
