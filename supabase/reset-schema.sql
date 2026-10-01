-- Script de reset: remove as tabelas antigas (com ids em formato texto/slug)
-- e recria tudo já com ids em uuid. Execute este arquivo no SQL Editor do
-- Supabase ANTES de rodar novamente o `supabase/schema.sql`.
--
-- ATENÇÃO: isso apaga todos os dados atuais (categorias, produtos, pedidos
-- e itens de pedido) do projeto Supabase conectado. Use apenas se você
-- realmente quer recomeçar do zero.

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
