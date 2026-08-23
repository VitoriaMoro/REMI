import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Home from './components/Home';
import IngredientInput from './components/IngredientInput';
import Filters from './components/Filters';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import { searchRecipesByIngredients, getRecipeDetails, getFilterOptions } from './api';
import { getFavorites, isFavorite, toggleFavorite } from './favorites';
import './App.css';

const EMPTY_FILTERS = { cuisine: '', diet: '', tempo: '', dificuldade: '', intolerances: [] };

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'search' | 'favorites'
  const [ingredients, setIngredients] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {
        // filtros são um extra; se não carregarem, a busca simples continua funcionando
        setFilterOptions(null);
      });
  }, []);

  function addIngredient(item) {
    setIngredients((prev) => [...prev, item]);
  }

  function removeIngredient(item) {
    setIngredients((prev) => prev.filter((i) => i !== item));
  }

  function handleToggleFavorite(recipe) {
    setFavorites(toggleFavorite(favorites, recipe));
  }

  async function handleSearch() {
    if (ingredients.length === 0) {
      setError('Adicione ao menos um ingrediente antes de buscar.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchRecipesByIngredients(ingredients, filters);
      setRecipes(data.recipes);
    } catch (err) {
      setError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectRecipe(id) {
    setLoading(true);
    setError(null);

    try {
      const recipe = await getRecipeDetails(id);
      setSelectedRecipe(recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function changeView(nextView) {
    setView(nextView);
    setSelectedRecipe(null);
    setError(null);
  }

  return (
    <div className="app">
      <Nav view={view} onChangeView={changeView} favoritesCount={favorites.length} />

      {view === 'home' && !selectedRecipe && <Home onStartSearch={() => changeView('search')} />}

      {(view === 'search' || view === 'favorites' || selectedRecipe) && (
        <div className="page">
          {selectedRecipe ? (
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => setSelectedRecipe(null)}
              isFavorite={isFavorite(favorites, selectedRecipe.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : view === 'favorites' ? (
            <>
              <h2 className="section-title">Seus favoritos</h2>
              <RecipeList
                recipes={favorites}
                onSelect={handleSelectRecipe}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                emptyMessage="Você ainda não favoritou nenhuma receita. Toque no coração de uma receita para guardá-la aqui."
              />
            </>
          ) : (
            <>
              <section className="search-card">
                <h2 className="section-title">O que você tem?</h2>
                <IngredientInput
                  ingredients={ingredients}
                  onAdd={addIngredient}
                  onRemove={removeIngredient}
                />

                <Filters options={filterOptions} values={filters} onChange={setFilters} />

                <button
                  type="button"
                  className="search-button"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Buscar receitas'}
                </button>

                {error && <p className="error-message">⚠️ {error}</p>}
              </section>

              {hasSearched && !loading && !error && (
                <RecipeList
                  recipes={recipes}
                  onSelect={handleSelectRecipe}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
