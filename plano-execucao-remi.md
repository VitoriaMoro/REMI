# Plano de Execução — App Remi

**Data:** 22/08/2026
**Produto:** Aplicativo de recomendação de receitas a partir dos ingredientes disponíveis na geladeira do usuário
**API de dados:** Spoonacular (via RapidAPI) — https://rapidapi.com/spoonacular/api/recipe-food-nutrition

---

## 1. Visão geral e proposta de valor

O Remi resolve o problema de "o que eu faço com o que eu tenho em casa?". O usuário informa os ingredientes disponíveis e o app retorna receitas ordenadas pela maior correspondência possível, com filtros adicionais de culinária/país, restrições alimentares, dificuldade e tempo de preparo.

**Objetivo do MVP:** validar o fluxo essencial — cadastrar ingredientes → buscar receitas por correspondência → aplicar filtros → ver detalhes da receita — com o menor escopo técnico possível.

---

## 2. Escopo

### MVP (Fase 1)
- Cadastro manual da lista de ingredientes (texto com autocomplete).
- Busca de receitas ordenadas por nº de ingredientes do usuário utilizados / nº de ingredientes faltantes.
- Filtros: culinária (país), dieta (vegana/vegetariana), intolerância (lactose/glúten), tempo de preparo.
- Tela de detalhe da receita (ingredientes, modo de preparo, tempo, porções, imagem).
- Lista de favoritos local.

### Fase 2 (pós-MVP)
- Filtro de dificuldade (métrica própria, calculada — ver seção 4.3).
- Login/conta na nuvem, sincronização de listas entre dispositivos.
- Histórico de receitas cozinhadas, avaliação do usuário.
- Sugestão de lista de compras para os ingredientes faltantes.
- Leitura da lista de ingredientes por foto (OCR/visão computacional) — funcionalidade separada, não coberta pela Spoonacular.
- Notificações ("ingrediente X está prestes a vencer").

### Fora de escopo (por ora)
- Scanner de nota fiscal / integração com geladeiras inteligentes (IoT).
- Criação de receitas próprias pelo usuário.

---

## 3. Personas e caso de uso principal

**Persona:** pessoa que cozinha em casa, quer reduzir desperdício de ingredientes e ganhar tempo decidindo o que cozinhar.

**Fluxo principal:**
1. Usuário abre o app e adiciona ingredientes que tem na geladeira/despensa (ex.: "frango, tomate, arroz, cebola").
2. Opcionalmente aplica filtros (culinária italiana, sem glúten, até 30 min).
3. App retorna lista de receitas ordenadas por compatibilidade (mais ingredientes do usuário usados, menos ingredientes faltando).
4. Usuário abre uma receita, vê modo de preparo e ingredientes faltantes.
5. Usuário marca como favorita ou volta para ajustar filtros.

---

## 4. Integração com a API Spoonacular — mapeamento técnico

A Spoonacular (plano RapidAPI) cobre quase todos os filtros pedidos nativamente. Pontos de atenção estão marcados abaixo.

### 4.1 Endpoints principais

| Necessidade | Endpoint | Observações |
|---|---|---|
| Buscar por ingredientes disponíveis | `GET /recipes/findByIngredients` | Parâmetros: `ingredients` (lista separada por vírgula), `ranking` (1 = maximizar uso dos ingredientes informados, 2 = minimizar ingredientes faltantes), `ignorePantry` (ignora itens básicos como sal/água), `number`. Retorna `usedIngredientCount` e `missedIngredientCount` — usar para ordenar por "maior nº de ingredientes que o usuário tem". |
| Busca combinada com filtros (dieta, culinária, tempo etc.) | `GET /recipes/complexSearch` | Suporta `includeIngredients`, `cuisine`, `diet`, `intolerances`, `type`, `maxReadyTime`, `sort`, entre outros. **Limitação:** este endpoint não pontua por "melhor correspondência de ingredientes" da mesma forma que o `findByIngredients`. |
| Detalhe da receita | `GET /recipes/{id}/information` | Ingredientes completos, modo de preparo passo a passo (`analyzedInstructions`), tempo, porções, imagem. |
| Informação nutricional | `GET /recipes/{id}/nutritionWidget.json` | Para exibir calorias/macros na tela de detalhe (funcionalidade extra de valor). |
| Autocomplete de ingredientes | `GET /food/ingredients/autocomplete` | Usar no campo de cadastro da lista, para evitar erros de digitação/idioma. |
| Receitas similares | `GET /recipes/{id}/similar` | Útil para "você também pode gostar". |

**Estratégia recomendada:** como nenhum endpoint único faz "match por ingredientes" + "todos os filtros" ao mesmo tempo com o mesmo critério de ordenação, a estratégia é:
1. Chamar `findByIngredients` com os ingredientes do usuário (sem filtros) para obter o universo de receitas ordenado por compatibilidade.
2. Cruzar os IDs retornados com `complexSearch` (usando `ids` via parâmetro compartilhado ou refazendo a busca com os filtros e comparando interseção) **ou**, alternativa mais simples para o MVP: usar diretamente `complexSearch` com `includeIngredients` + os filtros desejados, aceitando que a ordenação de "melhor match" será calculada no backend do Remi (ver 4.2), não pela API.

### 4.2 Cálculo de "match" (lógica própria do backend)

Como a ordenação por relevância de ingredientes precisa conviver com os filtros extras, o backend do Remi deve:
- Buscar candidatas via `complexSearch` já filtradas (país, dieta, intolerância, tempo).
- Para cada receita candidata, obter a lista de ingredientes (`information` ou os dados já retornados por `complexSearch` com `fillIngredients=true`, `addRecipeInformation=true`).
- Calcular localmente: `score = ingredientes_do_usuario_presentes / total_ingredientes_da_receita`.
- Ordenar pelo score antes de exibir.

Isso evita duas chamadas cruzadas e mantém uma única fonte de verdade para o filtro + ranking.

### 4.3 Filtro de dificuldade — atenção, não é nativo da API

A Spoonacular **não** possui campo de "dificuldade" (fácil/médio/complexo). Precisa ser um dado derivado, calculado pelo Remi com uma heurística simples, por exemplo:

| Nível | Regra sugerida |
|---|---|
| Fácil | `readyInMinutes ≤ 20` **e** nº de passos (`analyzedInstructions[].steps.length`) ≤ 5 |
| Médio | `readyInMinutes` entre 20–45 **ou** até 10 passos |
| Complexo | `readyInMinutes > 45` **ou** mais de 10 passos, ou `equipment`/técnicas avançadas |

Essa classificação deve ser calculada e cacheada quando a receita é buscada pela primeira vez (não recalcular a cada request).

### 4.4 Mapeamento dos filtros pedidos → parâmetros da API

| Filtro no app | Parâmetro Spoonacular |
|---|---|
| País/culinária | `cuisine` (ex.: Italian, Mexican, Chinese, Brazilian não existe nativamente — ver nota¹) |
| Vegana | `diet=vegan` |
| Vegetariana | `diet=vegetarian` (ou `lacto vegetarian`/`ovo vegetarian` se quiser granularidade) |
| Sem lactose | `intolerances=dairy` |
| Sem glúten | `diet=gluten free` ou `intolerances=gluten` |
| Tempo de preparo (rápido/médio/demorado) | `maxReadyTime` — definir faixas no app, ex.: rápido ≤20min, médio 21–45min, demorado >45min |
| Dificuldade | Calculado localmente (ver 4.3), não é parâmetro de API |
| Extras possíveis com a mesma API | `type` (café da manhã, sobremesa, prato principal...), `maxCalories`/`minCalories`, `sort` (popularity, healthiness, time), `equipment` |

¹ **Nota importante:** a lista de culinárias da Spoonacular é fixa e nem todos os países estão contemplados (não existe "Brazilian" como cuisine nativa, por exemplo — o mais próximo é "Latin American"). Validar a lista completa de valores aceitos na documentação oficial antes de montar o filtro na UI, para não prometer um país que a API não cobre.

### 4.5 Limites e custos do plano RapidAPI

- Verificar o plano contratado na Spoonacular (Basic/Pro/Ultra/Mega) e seus limites de requisições/dia — cada consulta de detalhe de receita conta como chamada separada.
- Implementar **cache** (Redis ou cache local no backend) para receitas já consultadas, já que o conteúdo de receitas muda pouco. Isso reduz custo e latência.
- Monitorar quota via header de resposta da RapidAPI (`X-RateLimit-Requests-Remaining`).

---

## 5. Arquitetura técnica proposta

```
[App Mobile/Web] → [Backend Remi (BFF)] → [Spoonacular API via RapidAPI]
                          │
                          ├─ Cache (Redis) de receitas e resultados de busca
                          ├─ Banco de dados (usuários, listas de ingredientes, favoritos)
                          └─ Lógica de scoring/dificuldade
```

**Por que um backend intermediário (BFF) é necessário:**
- A chave da RapidAPI **não pode** ficar exposta no app cliente (risco de abuso/custo).
- Permite implementar a lógica de ranking/dificuldade descrita acima sem depender só do que a API oferece.
- Permite cache e controle de custo.

### Stack sugerida
- **App:** React Native (Expo) ou Flutter — multiplataforma iOS/Android, equipe pequena.
- **Backend:** Node.js (NestJS/Express) ou similar, hospedado em serviço serverless (ex.: Render, Railway, AWS Lambda) para começar barato.
- **Banco de dados:** PostgreSQL (usuários, listas, favoritos) + Redis (cache de receitas).
- **Autenticação (Fase 2):** Firebase Auth ou Auth0.

---

## 6. Modelo de dados (simplificado)

- `User` (id, nome, e-mail)
- `PantryItem` (usuário, nome do ingrediente, quantidade opcional)
- `FavoriteRecipe` (usuário, recipe_id, snapshot de dados essenciais)
- `RecipeCache` (recipe_id, payload da API, dificuldade calculada, timestamp)

---

## 7. Cronograma por fases (estimativa para 1–2 devs)

| Fase | Duração estimada | Entregas |
|---|---|---|
| 0. Descoberta e setup | 1 semana | Conta RapidAPI/Spoonacular, definição de stack, protótipo de telas (Figma) |
| 1. MVP técnico | 2–3 semanas | Cadastro de ingredientes, integração `findByIngredients`, tela de resultados e detalhe |
| 2. Filtros | 1–2 semanas | `complexSearch` + filtros de país/dieta/intolerância/tempo, lógica de scoring |
| 3. Dificuldade e favoritos | 1 semana | Heurística de dificuldade, persistência de favoritos |
| 4. Polimento e testes | 1–2 semanas | Cache, tratamento de erros/limite de API, testes com usuários reais |
| 5. Lançamento beta | — | Publicação em loja (ou versão web) para grupo fechado de testes |

**Total estimado até beta:** ~7–9 semanas.

---

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Limite de requisições da API estourado com base de usuários crescendo | Cache agressivo + escolher plano RapidAPI adequado antes do lançamento |
| Falta de "dificuldade" nativa gerar classificação ruim | Validar heurística com um conjunto de receitas manualmente antes de confiar 100% |
| Culinária de um país não coberta pela API | Mapear e comunicar na UI apenas os países/culinárias realmente suportados |
| Nome de ingrediente digitado não bater com o vocabulário da API (idioma) | Usar `food/ingredients/autocomplete` e considerar tradução/normalização PT-BR → EN antes de enviar à API, já que a Spoonacular é majoritariamente em inglês |
| Custo da API crescer com o uso | Monitorar quota, criar limite de buscas gratuitas por usuário se necessário |

---

## 9. Métricas de sucesso do MVP

- Nº de buscas realizadas por usuário/semana.
- Taxa de receitas abertas em detalhe após resultado de busca.
- Nº de receitas favoritadas.
- Tempo médio de resposta da busca (meta: <2s com cache).

---

## 10. Próximos passos imediatos

1. Criar conta e assinar um plano na RapidAPI para a Spoonacular API.
2. Validar no dashboard da API a lista completa de valores aceitos para `cuisine`, `diet` e `intolerances`.
3. Montar protótipo de telas (wireframe) do fluxo: cadastro de ingredientes → resultados → filtros → detalhe.
4. Subir o backend inicial (BFF) com o endpoint `findByIngredients` funcionando ponta a ponta antes de somar filtros.
