import RecipeCard from './RecipeCard';

export default function RecipeList({ recipes, onSelect, favorites, onToggleFavorite, emptyMessage }) {
  if (recipes.length === 0) {
    return (
      <p className="empty-state">
        {emptyMessage || 'Nenhuma receita encontrada. Tente ajustar os ingredientes.'}
      </p>
    );
  }

  return (
    <ul className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onSelect={onSelect}
          isFavorite={favorites.some((f) => f.id === recipe.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  );
}
