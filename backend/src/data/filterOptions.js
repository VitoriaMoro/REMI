// Opções de filtro expostas pelo backend (GET /api/filters) para o frontend
// montar os selects sem duplicar essa lista em dois lugares.
// Valores (`value`) são os aceitos pela Spoonacular; `label` é o texto em PT-BR.

const cuisines = [
  { label: 'Africana', value: 'African' },
  { label: 'Americana', value: 'American' },
  { label: 'Britânica', value: 'British' },
  { label: 'Cajun', value: 'Cajun' },
  { label: 'Caribenha', value: 'Caribbean' },
  { label: 'Chinesa', value: 'Chinese' },
  { label: 'Europeia Oriental', value: 'Eastern European' },
  { label: 'Europeia', value: 'European' },
  { label: 'Francesa', value: 'French' },
  { label: 'Alemã', value: 'German' },
  { label: 'Grega', value: 'Greek' },
  { label: 'Indiana', value: 'Indian' },
  { label: 'Irlandesa', value: 'Irish' },
  { label: 'Italiana', value: 'Italian' },
  { label: 'Japonesa', value: 'Japanese' },
  { label: 'Judaica', value: 'Jewish' },
  { label: 'Coreana', value: 'Korean' },
  { label: 'Latino-americana', value: 'Latin American' },
  { label: 'Mediterrânea', value: 'Mediterranean' },
  { label: 'Mexicana', value: 'Mexican' },
  { label: 'Oriente Médio', value: 'Middle Eastern' },
  { label: 'Nórdica', value: 'Nordic' },
  { label: 'Sulista (EUA)', value: 'Southern' },
  { label: 'Espanhola', value: 'Spanish' },
  { label: 'Tailandesa', value: 'Thai' },
  { label: 'Vietnamita', value: 'Vietnamese' },
];

// Vegana/vegetariana mapeiam para o parâmetro `diet` da Spoonacular.
const diets = [
  { label: 'Vegetariana', value: 'vegetarian' },
  { label: 'Vegana', value: 'vegan' },
];

// Sem lactose/sem glúten mapeiam para o parâmetro `intolerances`.
const intolerances = [
  { label: 'Sem lactose', value: 'dairy' },
  { label: 'Sem glúten', value: 'gluten' },
];

// Não é parâmetro nativo da API — vira `maxReadyTime` na chamada e depois um
// filtro de faixa aplicado no backend sobre o `readyInMinutes` de cada receita.
const timeRanges = [
  { label: 'Rápido (até 20 min)', value: 'rapido', min: 0, max: 20 },
  { label: 'Médio (21–45 min)', value: 'medio', min: 21, max: 45 },
  { label: 'Demorado (mais de 45 min)', value: 'demorado', min: 46, max: Infinity },
];

// Não existe na Spoonacular — calculado pelo Remi a partir de readyInMinutes
// e número de passos do modo de preparo (ver services/difficulty.js).
const difficulties = [
  { label: 'Fácil', value: 'facil' },
  { label: 'Médio', value: 'medio' },
  { label: 'Complexo', value: 'complexo' },
];

module.exports = { cuisines, diets, intolerances, timeRanges, difficulties };
