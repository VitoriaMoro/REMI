// Cache simples em memória. Suficiente para o MVP rodando num único processo;
// se o backend escalar para múltiplas instâncias, trocar por Redis (ver plano
// de execução, seção "Limites e custos do plano RapidAPI").
const store = new Map();

function getCache(key) {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

function setCache(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

module.exports = { getCache, setCache };
