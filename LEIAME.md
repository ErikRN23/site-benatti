# Site de avaliações – Guilherme Benatti

## 1. Criar o banco no Supabase
1. Crie um projeto em supabase.com (plano gratuito serve).
2. Abra **SQL Editor > New query**, cole o conteúdo de `supabase.sql` e clique em **Run**.
3. Vá em **Project Settings > API** e copie:
   - **Project URL**
   - **anon public key** (a chave pública; nunca use a `service_role` no site)
4. Abra `index.html`, procure `COLE_AQUI_...` no começo do `<script>` e cole os dois valores.

## 2. Publicar no Vercel
- Pelo site: vercel.com > **Add New > Project** e envie a pasta (ou suba num repositório do GitHub e importe).
- Pelo terminal: dentro da pasta, rode `npx vercel --prod`.
- Não precisa de build: é um site estático (`index.html` + `logo.jpg`).

## 3. Ver as avaliações
- Entre em supabase.com > seu projeto > **Table Editor > avaliacoes**.
- Para guardar uma cópia: botão **Export > CSV** (abre no Excel ou Google Planilhas).
- Média das notas: **SQL Editor** > rode
  `select round(avg(nota_comida),1) as comida, round(avg(nota_servico),1) as servico, count(*) as total from avaliacoes;`

Só quem está logado na sua conta Supabase vê os dados. Os clientes só conseguem enviar.
