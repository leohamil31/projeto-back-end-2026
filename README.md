# Pastifico

Sistema de autoatendimento para restaurante italiano, com catálogo, pedidos, painel de cozinha e acompanhamento de status.

## Requisitos

- Node.js 20 LTS ou mais recente
- Postman Desktop (opcional, para testar a API)
- Projeto Supabase (opcional; o projeto também roda com JSON local)

## Executar localmente sem Supabase

1. Extraia a pasta do projeto e abra essa pasta no VS Code.
2. No terminal integrado, instale as dependências:

   ```powershell
   npm install
   ```

3. Copie `.env.example` para `.env` ou deixe as variáveis Supabase vazias para usar `data/pastifico-db.json`.
4. Inicie o servidor:

   ```powershell
   npm.cmd run dev
   ```

5. Abra no navegador:
   - Cliente: `http://localhost:3000/`
   - Cozinha: `http://localhost:3000/kitchen-dashboard`
   - Status de pedido: `http://localhost:3000/order-status`
   - Health check: `http://localhost:3000/api/health`

Mantenha o terminal do servidor aberto enquanto usa as páginas.

## Configurar Supabase

Para usar um projeto Supabase próprio:

1. Crie um projeto e execute `supabase/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env`.
3. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env`.
4. Para carregar o catálogo inicial (4 categorias e 27 produtos), execute uma vez:

   ```powershell
   npm.cmd run migrate:supabase
   ```

5. Inicie o servidor com `npm.cmd run dev`.

Para usar o Supabase compartilhado da equipe, peça ao responsável pela URL e chave de servidor por um canal seguro. Não execute a migração no projeto compartilhado sem combinar com a equipe. Nunca envie o `.env` ou a chave `service_role` no ZIP, Postman, Git ou chat.

Sem as duas variáveis Supabase, o backend usa automaticamente o JSON local. `GET /api/health` informa a persistência ativa em `persistence`.

## Testes

```powershell
npm.cmd run build
npm.cmd test
```

Os testes usam o armazenamento local e não devem conectar ao Supabase compartilhado.

## Testar no Postman

1. Inicie o servidor com `npm.cmd run dev`.
2. Importe estes arquivos no Postman (**Import → Files**):
   - `postman/Pastifico API.postman_collection.json`
   - `postman/Pastifico Local.postman_environment.json`
3. Selecione o ambiente **Pastifico Local**.
4. Use o **Postman Desktop Agent** para que o Postman possa acessar `localhost`.
5. Teste primeiro `Sistema → Health check`; a resposta esperada é `200 OK`.
6. Para chamadas que criam dados, use `Categorias → Criar categoria`, `Produtos → Criar produto` ou `Pedidos → Criar pedido de exemplo`. Essas chamadas gravam no banco selecionado.

## Pagamento

PIX, cartão e dinheiro são selecionados no pedido e concluídos presencialmente no caixa. O projeto não processa pagamentos online.

## API

- `GET /api/health`
- `GET /categories`, `POST /categories`
- `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`
- `GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id/status`
- `GET /orders/kitchen`, `GET /orders/table/:tableNumber`
