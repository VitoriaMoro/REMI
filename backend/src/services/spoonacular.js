const BASE_URL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com';

function getHeaders() {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const apiHost = process.env.SPOONACULAR_API_HOST;

  if (!apiKey) {
    throw new Error(
      'SPOONACULAR_API_KEY não configurada. Crie um arquivo .env em backend/ com base no .env.example.'
    );
  }

  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost,
  };
}

// Lança um erro com `.status` anexado, para que routes/recipes.js consiga
// devolver uma mensagem amigável (limite da API, chave inválida, etc.) sem
// ter que reanalisar o texto da mensagem.
async function throwSpoonacularError(response, context) {
  const body = await response.text();
  const error = new Error(`Spoonacular ${context} falhou (${response.status}): ${body}`);
  error.status = response.status;
  throw error;
}

/**
 * Busca receitas que usam o máximo possível dos ingredientes informados.
 * https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients
 */
async function findByIngredients({ ingredients, number = 20, ignorePantry = true }) {
  const params = new URLSearchParams({
    ingredients: ingredients.join(','),
    number: String(number),
    ranking: '1', // maximiza o uso dos ingredientes informados
    ignorePantry: String(ignorePantry),
  });

  const response = await fetch(`${BASE_URL}/recipes/findByIngredients?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    await throwSpoonacularError(response, 'findByIngredients');
  }

  return response.json();
}

/**
 * Busca com filtros (culinária, dieta, intolerância, tempo) usando o motor de
 * busca completo da Spoonacular. Diferente do findByIngredients, este
 * endpoint não devolve usedIngredientCount/missedIngredientCount prontos —
 * por isso pedimos fillIngredients=true e calculamos o match no backend
 * (ver routes/recipes.js).
 * https://spoonacular.com/food-api/docs#Search-Recipes-Complex
 */
async function complexSearch({
  includeIngredients = [],
  cuisine,
  diet,
  intolerances,
  maxReadyTime,
  number = 30,
}) {
  const params = new URLSearchParams({
    number: String(number),
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    instructionsRequired: 'false',
  });

  if (includeIngredients.length > 0) {
    params.set('includeIngredients', includeIngredients.join(','));
    // ordena priorizando quem usa mais dos ingredientes informados
    params.set('sort', 'max-used-ingredients');
  }
  if (cuisine) params.set('cuisine', cuisine);
  if (diet) params.set('diet', diet);
  if (intolerances) params.set('intolerances', intolerances);
  if (maxReadyTime) params.set('maxReadyTime', String(maxReadyTime));

  const response = await fetch(`${BASE_URL}/recipes/complexSearch?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    await throwSpoonacularError(response, 'complexSearch');
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Detalhe completo de uma receita: ingredientes, modo de preparo, tempo, porções.
 * https://spoonacular.com/food-api/docs#Get-Recipe-Information
 */
async function getRecipeInformation(id, { includeNutrition = false } = {}) {
  const params = new URLSearchParams({ includeNutrition: String(includeNutrition) });

  const response = await fetch(
    `${BASE_URL}/recipes/${id}/information?${params.toString()}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    await throwSpoonacularError(response, 'getRecipeInformation');
  }

  return response.json();
}

module.exports = {
  findByIngredients,
  complexSearch,
  getRecipeInformation,
};
