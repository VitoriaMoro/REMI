const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getFilterOptions() {
  const response = await fetch(`${API_URL}/api/filters`);
  if (!response.ok) {
    throw new Error('Erro ao carregar opções de filtro.');
  }
  return response.json();
}

export async function searchRecipesByIngredients(ingredients, filters = {}) {
  const params = new URLSearchParams({ ingredients: ingredients.join(',') });

  if (filters.cuisine) params.set('cuisine', filters.cuisine);
  if (filters.diet) params.set('diet', filters.diet);
  if (filters.tempo) params.set('tempo', filters.tempo);
  if (filters.dificuldade) params.set('dificuldade', filters.dificuldade);
  if (filters.intolerances?.length) params.set('intolerances', filters.intolerances.join(','));

  const response = await fetch(`${API_URL}/api/recipes/by-ingredients?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar receitas.');
  }

  return data;
}

export async function getRecipeDetails(id) {
  const response = await fetch(`${API_URL}/api/recipes/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar detalhes da receita.');
  }

  return data;
}
