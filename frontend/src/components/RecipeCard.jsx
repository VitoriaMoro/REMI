const DIFFICULTY_LABEL = { facil: 'Fácil', medio: 'Médio', complexo: 'Complexo' };

export default function RecipeCard({ recipe, onSelect, isFavorite, onToggleFavorite }) {
  return (
    <li className="recipe-card" onClick={() => onSelect(recipe.id)}>
      <img src={recipe.image} alt={recipe.title} loading="lazy" />
      <div className="recipe-card-body">
        <div className="recipe-card-title-row">
          <h3>{recipe.title}</h3>
          <button
            type="button"
            className="favorite-button"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe);
            }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {recipe.matchScore !== undefined && (
          <>
            <div className="match-score">
              <div className="match-bar">
                <div className="match-bar-fill" style={{ width: `${recipe.matchScore}%` }} />
              </div>
              <span>{recipe.matchScore}% de compatibilidade</span>
            </div>
            <p className="ingredient-summary">
              ✅ {recipe.usedIngredientCount} que você tem
              {recipe.missedIngredientCount > 0 && (
                <> · ⚠️ {recipe.missedIngredientCount} faltando</>
              )}
            </p>
          </>
        )}

        <div className="recipe-card-tags">
          {recipe.readyInMinutes && <span className="tag">⏱ {recipe.readyInMinutes} min</span>}
          {recipe.difficulty && (
            <span className="tag">📊 {DIFFICULTY_LABEL[recipe.difficulty] || recipe.difficulty}</span>
          )}
        </div>
      </div>
    </li>
  );
}
