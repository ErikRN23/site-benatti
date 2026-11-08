-- Banco de dados do formulário de avaliações (Supabase / PostgreSQL)

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text check (char_length(nome) <= 80),
  evento text check (char_length(evento) <= 80),
  nota_comida smallint not null check (nota_comida between 1 and 5),
  nota_servico smallint not null check (nota_servico between 1 and 5),
  comentario_comida text check (char_length(comentario_comida) <= 1000),
  comentario_servico text check (char_length(comentario_servico) <= 1000),
  sugestao text check (char_length(sugestao) <= 1500)
);

alter table public.avaliacoes enable row level security;

-- Permite que visitantes enviem avaliações.
drop policy if exists "Clientes podem enviar avaliacoes" on public.avaliacoes;
create policy "Clientes podem enviar avaliacoes"
on public.avaliacoes
for insert
to anon
with check (true);

-- Por segurança, não há políticas públicas de SELECT, UPDATE ou DELETE.
-- O painel administrativo precisa de autenticação e políticas próprias.
