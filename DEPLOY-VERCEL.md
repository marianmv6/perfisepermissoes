# Publicar em produção — perfisepermissoes.vercel.app

URL de produção: **https://perfisepermissoes.vercel.app**

O projeto já está configurado com `vercel.json` (Vite, pasta `dist`, SPA).

---

## Opção A — Vercel + GitHub (recomendado)

Deploy automático a cada `git push`.

### 1. Repositório no GitHub

Na pasta `modulo-perfis-permissoes`:

```powershell
git init
git add .
git commit -m "Módulo Perfis e permissões — versão inicial"
```

No GitHub: **New repository** → nome sugerido: `perfisepermissoes` → criar sem README.

Conectar e enviar:

```powershell
git remote add origin https://github.com/SEU_USUARIO/perfisepermissoes.git
git branch -M main
git push -u origin main
```

### 2. Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) → login com GitHub.
2. **Add New…** → **Project** → importe o repositório `perfisepermissoes`.
3. Confirme:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `.` (raiz do repositório)
4. Em **Project Name**, use: `perfisepermissoes` (gera `perfisepermissoes.vercel.app`).
5. **Deploy**.

---

## Opção B — Vercel CLI (deploy direto)

Na pasta `modulo-perfis-permissoes`:

```powershell
npx vercel login
npx vercel link --project perfisepermissoes
npx vercel deploy --prod
```

Na primeira vez, confirme criar o projeto **perfisepermissoes** quando o CLI perguntar.

---

## Atualizar produção depois

Com GitHub conectado:

```powershell
.\push-perfisepermissoes.ps1 "Descrição da alteração"
```

Ou manualmente:

```powershell
git add .
git commit -m "Sua mensagem"
git push
```

Com CLI:

```powershell
npx vercel deploy --prod
```
