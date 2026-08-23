// A Spoonacular não tem campo de dificuldade. Heurística própria do Remi,
// combinando tempo de preparo e número de passos do modo de preparo.
// Ver seção 4.3 do plano de execução (plano-execucao-remi.md).
function computeDifficulty(readyInMinutes, stepCount) {
  // sem tempo de preparo (ex.: resultado do findByIngredients, que não traz
  // esse campo) não dá pra estimar com confiança — melhor não mostrar nada
  // do que rotular tudo como "médio" por um valor padrão inventado.
  if (readyInMinutes == null) return null;

  const steps = stepCount ?? 0;

  if (readyInMinutes <= 20 && steps <= 5) return 'facil';
  if (readyInMinutes > 45 || steps > 10) return 'complexo';
  return 'medio';
}

module.exports = { computeDifficulty };
