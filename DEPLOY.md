# Deploy do Remi (Render)

O código já está pronto e commitado localmente, com um `render.yaml` que descreve os dois serviços (backend + frontend). Faltam só os passos abaixo, que exigem login nas suas contas — por segurança, eu não crio contas nem digito credenciais/chaves por você.

## 1. Subir o código para o GitHub

Crie um repositório **vazio** (sem README/gitignore) em https://github.com/new — sugestão de nome: `remi`. Depois, neste terminal:

```bash
cd "/c/Users/Vitoria/Documents/REMI"
git remote add origin https://github.com/SEU_USUARIO/remi.git
git branch -M main
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu usuário do GitHub. Se pedir login, use suas credenciais do GitHub normalmente (ou um token, se tiver 2FA).

## 2. Criar a conta / logar no Render

Acesse https://render.com e entre com "Sign in with GitHub" (mais simples — já autoriza o acesso ao repositório).

## 3. Criar o Blueprint

1. No painel do Render, clique em **New +** → **Blueprint**.
2. Selecione o repositório `remi` que você acabou de criar.
3. O Render vai ler o `render.yaml` da raiz e propor 2 serviços: `remi-backend` (Web Service) e `remi-frontend` (Static Site).
4. Antes de confirmar, ele vai pedir os valores marcados como secretos no `render.yaml`:
   - **`SPOONACULAR_API_KEY`** (no serviço `remi-backend`): cole aqui a sua chave da RapidAPI — **é o único lugar onde ela deve ser colada, direto no painel do Render, nunca em um chat ou arquivo versionado**.
   - **`VITE_API_URL`** (no serviço `remi-frontend`): como o nome do backend no `render.yaml` é `remi-backend`, a URL pública dele **provavelmente** vai ser `https://remi-backend.onrender.com` — coloque esse valor por enquanto (ajustamos no passo 5 se estiver diferente).
5. Clique em **Apply** / **Create Blueprint**.

## 4. Aguardar o build

Os dois serviços vão buildar automaticamente (leva alguns minutos). Acompanhe os logs de cada um no painel do Render — se o backend falhar, o log geralmente aponta o motivo (ex.: variável de ambiente faltando).

## 5. Conferir a URL do backend e ajustar o frontend se necessário

1. Abra o serviço **remi-backend** no painel e copie a URL pública dele (aparece no topo, algo como `https://remi-backend-xxxx.onrender.com`).
2. Se essa URL for **diferente** do que você colocou em `VITE_API_URL` no passo 3, vá em **remi-frontend → Environment**, atualize `VITE_API_URL` com a URL correta, e clique em **Manual Deploy → Deploy latest commit** (o frontend precisa **rebuildar**, porque o Vite grava essa URL dentro dos arquivos estáticos na hora do build — só reiniciar não é suficiente).

## 6. Testar

Abra a URL pública do **remi-frontend** (ex.: `https://remi-frontend.onrender.com`) — o app completo deve funcionar: busca por ingredientes, filtros, detalhe de receita e favoritos.

## Coisas a saber sobre o plano gratuito do Render

- O backend **"dorme"** depois de ~15 min sem uso; a primeira requisição depois disso demora uns 30–50s pra "acordar" (normal, não é bug).
- O cache em memória do backend (`backend/src/services/cache.js`) é zerado toda vez que o serviço reinicia/dorme — sem problema, ele só existe pra economizar chamadas repetidas em uma mesma sessão de uso.
- Se quiser trocar a `SPOONACULAR_API_KEY` depois (ex.: nova chave), edite em **remi-backend → Environment** e clique em **Manual Deploy**.

## Depois do primeiro deploy: como atualizar

Sempre que você (ou eu) alterar o código:

```bash
git add -A
git commit -m "sua mensagem"
git push
```

O Render redeploya automaticamente a cada push na branch `main`.
