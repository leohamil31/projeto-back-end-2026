# Pastifico API

Sistema de autoatendimento para um restaurante italiano (Pastifico), com catálogo de produtos, carrinho de pedidos, painel de cozinha e acompanhamento de status do pedido.

## 1. Descrição do projeto

A Pastifico API resolve o problema de pedidos presenciais em um restaurante de massas italianas: o cliente monta o próprio pedido pelo totem/app, a cozinha acompanha os pedidos recebidos em um painel próprio e o cliente consegue acompanhar o status (`Recebido` → `Preparando` → `Pronto` → `Entregue`) em tempo real.

- **Domínio escolhido:** restaurante (autoatendimento).
- **Objetivo da API:** expor endpoints REST para gerenciar o catálogo (categorias e produtos) e o ciclo de vida dos pedidos (criação, consulta, atualização de status e remoção), persistindo os dados no Supabase/PostgreSQL.

## 2. Integrantes da equipe

- Leonardo Hamilton Moreira de Camargo
- Gabriel Henrique Brito Nery
- Ana Gabriela Rodrigues Harps

## 3. Tecnologias utilizadas

- Node.js
- TypeScript
- Express 5
- Supabase (`@supabase/supabase-js`)
- PostgreSQL (via Supabase)
- dotenv (variáveis de ambiente)
- tsx (execução/watch em desenvolvimento)
- Supertest + Node Test Runner (`node:test`) para testes automatizados
- Git / GitHub (versionamento)

## 4. Entidades e relacionamento

O projeto possui 4 entidades, formando dois pares relacionados por chave estrangeira (categoria/produto e pedido/itens do pedido):

### Category (categoria)

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador único |
| name | string | Nome da categoria |
| description | string | Descrição da categoria |
| createdAt | datetime | Data de criação |

### Product (produto)

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador único |
| name | string | Nome do produto |
| description | string | Descrição do produto |
| price | number | Preço unitário |
| image | string | URL da imagem do produto |
| isAvailable | boolean | Se o produto está disponível para venda |
| categoryId | uuid (FK) | Referência à categoria do produto |
| createdAt | datetime | Data de criação |

### Order (pedido)

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador único |
| customerName | string | Nome do cliente |
| tableNumber | number | Número da mesa |
| status | string | `Recebido`, `Preparando`, `Pronto` ou `Entregue` |
| items | OrderItem[] | Itens do pedido |
| total | number | Valor total do pedido |
| paymentMethod | string | `PIX`, `Cartão` ou `Dinheiro` |
| paymentStatus | string | `Aguardando no caixa` ou `Pago` |
| createdAt | datetime | Data de criação |

### OrderItem (item do pedido)

| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | Identificador único |
| orderId | uuid (FK) | Referência ao pedido |
| productId | uuid (FK) | Referência ao produto |
| name | string | Nome do produto no momento da compra |
| quantity | number | Quantidade |
| unitPrice | number | Preço unitário cobrado |
| subtotal | number | `quantity * unitPrice` |
| options | string[] | Adicionais escolhidos (ex.: "Bacon crocante") |

**Relacionamentos:**

- Uma **Categoria** pode possuir vários **Produtos**; cada **Produto** pertence a uma única **Categoria** (`products.category_id → categories.id`).
- Um **Pedido** pode possuir vários **Itens de pedido**; cada **Item** pertence a um único **Pedido** (`order_items.order_id → orders.id`) e referencia o **Produto** vendido (`order_items.product_id → products.id`).

## 5. Estrutura do projeto

```
src/
├── config/          # Conexão com Supabase e persistência local (fallback em JSON)
├── controllers/     # Recebem a requisição HTTP, validam entrada e chamam os repositories
├── middlewares/      # asyncHandler (captura de erros assíncronos) e errorHandler central
├── models/            # Interfaces/tipos das entidades (Category, Product, Order)
├── repositories/       # Acesso a dados (Supabase ou JSON local) para cada entidade
├── routes/              # Definição das rotas Express de cada recurso
├── utils/                 # Funções utilitárias (ex.: normalização de parâmetros de rota)
├── app.ts                  # Configuração do Express (middlewares, rotas, tratamento de erro)
└── server.ts                 # Ponto de entrada; inicia o servidor HTTP

tests/        # Testes automatizados (node:test + supertest)
scripts/      # Script de migração do JSON local para o Supabase
supabase/     # Scripts SQL (schema e reset) para criar/recriar as tabelas
public/       # Front-end estático (cliente, painel da cozinha, status do pedido)
data/         # Banco de dados local em JSON (fallback quando o Supabase não está configurado)
```

## 6. Configuração e execução

### Pré-requisitos

- Node.js 20 LTS ou mais recente
- Uma conta/projeto no [Supabase](https://supabase.com) (opcional — sem ele, o projeto roda com um arquivo JSON local)

### Passo a passo

1. Clone o repositório:

   ```powershell
   git clone https://github.com/leohamil31/projeto-back-end-2026.git
   cd projeto-back-end-2026
   ```

2. Instale as dependências:

   ```powershell
   npm install
   ```

3. Configure as variáveis de ambiente (veja a seção [7](#7-variáveis-de-ambiente)):

   ```powershell
   Copy-Item .env.example .env
   ```

4. Inicie a aplicação em modo desenvolvimento:

   ```powershell
   npm run dev
   ```

5. Acesse no navegador:
   - Cliente: `http://localhost:3000/`
   - Painel da cozinha: `http://localhost:3000/kitchen-dashboard`
   - Status do pedido: `http://localhost:3000/order-status`
   - Health check: `http://localhost:3000/api/health`

### Outros comandos

```powershell
npm run build    # Compila o TypeScript para dist/
npm start        # Executa a versão compilada (dist/server.js)
npm test         # Executa os testes automatizados (usa sempre o armazenamento local)
```

## 7. Variáveis de ambiente

O arquivo `.env.example` documenta as variáveis necessárias (sem valores reais):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

- Se **ambas** estiverem vazias, a API usa automaticamente o arquivo local `data/pastifico-db.json` para persistir os dados.
- Se **ambas** estiverem preenchidas com as credenciais do seu projeto Supabase, a API passa a usar o Supabase/PostgreSQL.

**Importante:** o arquivo `.env` com as credenciais reais nunca é enviado ao Git (está listado no `.gitignore`). Apenas o `.env.example`, com os nomes das variáveis vazios, é versionado.

## 8. Banco de dados

O banco utiliza 4 tabelas no PostgreSQL (Supabase), criadas pelo script [`supabase/schema.sql`](./supabase/schema.sql):

- `categories` (`id uuid`, `name`, `description`, `created_at`)
- `products` (`id uuid`, `name`, `description`, `price`, `image`, `is_available`, `category_id uuid → categories.id`, `created_at`)
- `orders` (`id uuid`, `customer_name`, `table_number`, `status`, `total`, `payment_method`, `payment_status`, `created_at`)
- `order_items` (`id uuid`, `order_id uuid → orders.id`, `product_id uuid → products.id`, `name`, `quantity`, `unit_price`, `subtotal`, `options`)

Todas as chaves primárias usam `uuid` (gerado com `gen_random_uuid()`), e as relações entre `products → categories`, `order_items → orders` e `order_items → products` são implementadas com chaves estrangeiras (Foreign Key).

Para reproduzir a estrutura em um projeto Supabase novo:

1. Abra o **SQL Editor** do seu projeto Supabase.
2. Execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. (Opcional) Para carregar o catálogo inicial de exemplo (4 categorias e 27 produtos) a partir do `data/pastifico-db.json`, rode:

   ```powershell
   npm run migrate:supabase
   ```

Caso precise recomeçar do zero em um projeto Supabase já existente, use [`supabase/reset-schema.sql`](./supabase/reset-schema.sql) antes do `schema.sql` (⚠️ isso apaga todos os dados atuais das tabelas).

## 9. Documentação dos endpoints

### Categorias

| Método | Endpoint | Descrição | Corpo da requisição |
|---|---|---|---|
| GET | `/categories` | Lista todas as categorias | — |
| GET | `/categories/:id` | Consulta uma categoria pelo id | — |
| POST | `/categories` | Cadastra uma nova categoria | `{ "name": string, "description": string }` |
| PUT | `/categories/:id` | Atualiza uma categoria | `{ "name"?: string, "description"?: string }` |
| DELETE | `/categories/:id` | Remove uma categoria | — |

### Produtos

| Método | Endpoint | Descrição | Corpo da requisição |
|---|---|---|---|
| GET | `/products` | Lista todos os produtos | — |
| GET | `/products/:id` | Consulta um produto pelo id | — |
| POST | `/products` | Cadastra um novo produto | `{ "name": string, "description": string, "price": number, "image": string, "isAvailable": boolean, "categoryId": string }` |
| PUT | `/products/:id` | Atualiza um produto | Qualquer subconjunto dos campos acima |
| DELETE | `/products/:id` | Remove um produto | — |

### Pedidos

| Método | Endpoint | Descrição | Corpo da requisição |
|---|---|---|---|
| GET | `/orders` | Lista todos os pedidos | — |
| GET | `/orders/:id` | Consulta um pedido pelo id | — |
| POST | `/orders` | Cria um novo pedido | `{ "customerName": string, "tableNumber": number, "items": [{ "productId": string, "quantity": number, "options"?: string[] }], "paymentMethod"?: "PIX" \| "Cartão" \| "Dinheiro" }` |
| PATCH | `/orders/:id/status` | Atualiza o status do pedido | `{ "status": "Recebido" \| "Preparando" \| "Pronto" \| "Entregue" }` |
| DELETE | `/orders/:id` | Remove um pedido | — |
| GET | `/orders/kitchen` | Lista pedidos pendentes para a cozinha (status diferente de `Entregue`) | — |
| GET | `/orders/table/:tableNumber` | Lista os pedidos de uma mesa | — |

### Sistema

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/health` | Retorna status da API e o tipo de persistência ativa (`supabase` ou `local-json`) |

## 10. Exemplos de requisições

**Criar categoria** — `POST /categories`

```json
{
  "name": "Sobremesas",
  "description": "Doçura final com sabores italianos clássicos"
}
```

**Criar produto** — `POST /products`

```json
{
  "name": "Tiramisu",
  "description": "Clássico italiano com café, mascarpone e cacau.",
  "price": 21.9,
  "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
  "isAvailable": true,
  "categoryId": "5502efc9-d2bf-44a8-b8a1-fafc81dbbea6"
}
```

**Atualizar produto (preço e disponibilidade)** — `PUT /products/:id`

```json
{
  "price": 24.9,
  "isAvailable": false
}
```

**Criar pedido** — `POST /orders`

```json
{
  "customerName": "Maria",
  "tableNumber": 5,
  "paymentMethod": "PIX",
  "items": [
    {
      "productId": "4ace3d9a-90f9-44fc-956f-b7a83bdda1ad",
      "quantity": 2,
      "options": ["Bacon crocante"]
    }
  ]
}
```

**Atualizar status do pedido** — `PATCH /orders/:id/status`

```json
{
  "status": "Preparando"
}
```

## Testes

```powershell
npm run build
npm test
```

Os testes automatizados usam sempre o armazenamento local (`data/pastifico-db.json`) e não se conectam ao Supabase, mesmo que o `.env` esteja configurado.

## Testar no Postman

1. Inicie o servidor com `npm run dev`.
2. Importe estes arquivos no Postman (**Import → Files**):
   - `postman/Pastifico API.postman_collection.json`
   - `postman/Pastifico Local.postman_environment.json`
3. Selecione o ambiente **Pastifico Local**.
4. Teste primeiro `Sistema → Health check`; a resposta esperada é `200 OK`.
5. Rode `Categorias → Listar categorias` e `Produtos → Listar produtos` para capturar automaticamente os ids (uuid) reais nas variáveis `categoryId` e `productId` da coleção.
6. A partir daí, as demais requisições (criar, atualizar, remover produto/categoria/pedido) já funcionam usando esses ids capturados automaticamente pelos scripts de teste de cada requisição.

## Observação sobre pagamentos

PIX, cartão e dinheiro são apenas selecionados no pedido e concluídos presencialmente no caixa. O projeto não processa pagamentos online.
