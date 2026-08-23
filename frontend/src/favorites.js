const STORAGE_KEY = 'remi:favorites';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // localStorage corrompido ou indisponível (ex.: modo privado) — segue sem favoritos
    return [];
  }
}

export function isFavorite(favorites, id) {
  return favorites.some((r) => r.id === id);
}

// Recebe só os campos que interessam mostrar depois na lista de favoritos —
// evita guardar o payload inteiro (ingredientes, resumo, etc.) no localStorage.
export function toggleFavorite(favorites, recipe) {
  const exists = isFavorite(favorites, recipe.id);
  const next = exists
    ? favorites.filter((r) => r.id !== recipe.id)
    : [
        ...favorites,
        {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          difficulty: recipe.difficulty,
        },
      ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
