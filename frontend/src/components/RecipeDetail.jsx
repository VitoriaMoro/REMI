export default function RecipeDetail({ recipe, onBack, isFavorite, onToggleFavorite }) {
  return (
    <div className="recipe-detail">
      <button type="button" className="back-button" onClick={onBack}>
        ← Voltar para os resultados
      </button>

      <div className="recipe-card-title-row">
        <h2>{recipe.title}</h2>
        <button
          type="button"
          className="favorite-button"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={() => onToggleFavorite(recipe)}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <img src={recipe.image} alt={recipe.title} className="recipe-detail-image" />

      <div className="recipe-meta">
        <span>⏱ {recipe.readyInMinutes} min</span>
        <span>🍽 {recipe.servings} porções</span>
        {recipe.difficulty && (
          <span>
            📊 {{ facil: 'Fácil', medio: 'Médio', complexo: 'Complexo' }[recipe.difficulty] || recipe.difficulty}
          </span>
        )}
      </div>

      <h3>Ingredientes</h3>
      <ul>
        {recipe.ingredients.map((ing, idx) => (
          <li key={idx}>{ing.original}</li>
        ))}
      </ul>

      <h3>Modo de preparo</h3>
      {recipe.steps.length > 0 ? (
        <ol>
          {recipe.steps.map((step) => (
            <li key={step.number}>{step.step}</li>
          ))}
        </ol>
      ) : (
        <p>
          Modo de preparo detalhado não disponível.{' '}
          <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            Ver receita completa na fonte original
          </a>
          .
        </p>
      )}
    </div>
  );
}
