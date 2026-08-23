# Remi — MVP

App que sugere receitas a partir dos ingredientes disponíveis na geladeira do usuário, usando a Spoonacular API (RapidAPI).

🔗 **No ar:** https://remi-frontend-65kj.onrender.com (backend em https://remi-backend-65kj.onrender.com)

Ver o plano completo em [`plano-execucao-remi.md`](./plano-execucao-remi.md). Para colocar no ar (ou refazer o deploy), ver [`DEPLOY.md`](./DEPLOY.md).

## Estrutura

```
REMI/
  backend/    Node.js + Express — proxy seguro para a Spoonacular API
  frontend/   React + Vite — interface web
```

## Como rodar localmente

**Backend**
```bash
cd backend
npm install
# copie .env.example para .env e coloque sua chave da RapidAPI
npm run dev
```
Sobe em `http://localhost:3001`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Sobe em `http://localhost:5173`.

## Status das fases do MVP

- [x] **Fase 1 — Scaffold**: backend e frontend rodando localmente.
- [x] **Fase 2 — Busca por ingredientes**: tela de cadastro de ingredientes, integração com `findByIngredients`, ranking por compatibilidade. **Testado ponta a ponta com a API real.**
- [x] **Fase 3 — Detalhe da receita**: tela com ingredientes, modo de preparo, tempo e porções. **Testado ponta a ponta com a API real.**
- [x] **Fase 4 — Filtros**: país/culinária, dieta (vegana/vegetariana), restrições (sem lactose/sem glúten), tempo de preparo e **dificuldade** (bônus, calculada — ver abaixo). **Testado ponta a ponta com a API real.**
- [x] **Fase 5 — Favoritos e polish**: favoritos (localStorage, aba própria), cache em memória no backend (busca e detalhe), mensagens de erro amigáveis. **Testado ponta a ponta com a API real**, incluindo persistência após reload.

### Como os filtros funcionam por baixo dos panos

- Sem nenhum filtro: usa `findByIngredients` (mais simples e rápido).
- Com qualquer filtro: usa `complexSearch` (`cuisine`, `diet`, `intolerances`, `maxReadyTime`) + `fillIngredients=true`, e o **backend calcula o `matchScore`** comparando os ingredientes da receita com os do usuário — a Spoonacular não devolve esse cálculo pronto nesse endpoint.
- **Dificuldade** (fácil/médio/complexo) não existe na Spoonacular. É calculada em `backend/src/services/difficulty.js` a partir do tempo de preparo e do número de passos do modo de preparo.
- Filtro de tempo tem 3 faixas (rápido ≤20min, médio 21–45min, demorado 46min+); a API só aceita um teto (`maxReadyTime`), então o backend também filtra a faixa exata localmente.

## Idioma dos ingredientes — resolvido

A Spoonacular é uma API em inglês, então o backend traduz automaticamente o que o usuário digita em PT-BR antes de buscar (`backend/src/services/ingredientTranslator.js` + dicionário em `backend/src/data/ingredientTranslations.js`), e tenta trazer de volta para PT-BR os nomes de ingredientes que a API retorna. Testado e validado: "frango, tomate, arroz" agora produz os mesmos resultados/ranking que buscar diretamente em inglês.

**Limitações do dicionário (aceitáveis para o MVP):**
- Cobre os ingredientes mais comuns de geladeira/despensa brasileira (~90 termos). Um ingrediente digitado que não esteja no dicionário é enviado como está (a API pode ou não reconhecê-lo).
- A tradução de volta para PT-BR é "melhor esforço": frases longas (ex.: o modo de preparo, o resumo da receita) continuam em inglês; só nomes de ingredientes são traduzidos, e podem sair com texto misto (ex.: "spanish-syle arroz mix").
- Para adicionar novos ingredientes, edite `backend/src/data/ingredientTranslations.js`.

## Favoritos, cache e erros (Fase 5)

- **Favoritos**: guardados no `localStorage` do navegador (`frontend/src/favorites.js`), sem backend/conta — funciona offline e sobrevive a reload, mas é por navegador/dispositivo (não sincroniza entre aparelhos; isso ficaria pra uma fase com conta de usuário).
- **Cache**: `backend/src/services/cache.js` guarda em memória o resultado de buscas (10 min) e de detalhes de receita (6 horas), reduzindo chamadas repetidas à Spoonacular. É em memória (não Redis) — válido pra rodar um único processo, como no MVP; reinicia zerado a cada `npm run dev`.
- **Erros amigáveis**: `backend/src/services/friendlyError.js` traduz códigos HTTP da API (401/403/402/429) em mensagens que fazem sentido pra quem usa o app, em vez do JSON cru da RapidAPI.

### Nota sobre o ambiente: pasta dentro do OneDrive (Documents)

Como este projeto vive em `Documents`, que normalmente é sincronizado pelo OneDrive, o Vite pode falhar em detectar mudanças de arquivo (hot reload trava servindo uma versão antiga). **Se editar um arquivo e o comportamento no navegador não mudar, reinicie `npm run dev` do frontend** — isso força reler tudo do disco. Se o problema for recorrente, mover o projeto para fora de uma pasta sincronizada (ex.: `C:\dev\remi`) resolve de vez.

## Importante: assinatura da API

Ter uma API key da RapidAPI não é suficiente — é preciso **assinar** a Spoonacular API especificamente (mesmo no plano gratuito). Isso já foi feito e validado nesta conta.
