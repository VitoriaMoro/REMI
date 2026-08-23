// Traduz erros HTTP da Spoonacular/RapidAPI para mensagens que fazem sentido
// pra quem está usando o app (e não só pra quem está lendo o log).
function toFriendlyMessage(error) {
  switch (error.status) {
    case 401:
    case 403:
      return 'A chave da API não está autorizada nessa API. Verifique se ela está assinada em rapidapi.com/spoonacular/api/recipe-food-nutrition.';
    case 402:
      return 'A cota do plano contratado na Spoonacular foi excedida.';
    case 429:
      return 'Limite diário de requisições da API atingido. Tente novamente mais tarde ou faça upgrade do plano no RapidAPI.';
    default:
      return error.message;
  }
}

module.exports = { toFriendlyMessage };
