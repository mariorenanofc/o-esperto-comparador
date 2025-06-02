
# Backend Setup - Clerk + Neon DB + Prisma

Este documento descreve como configurar o backend completo para a aplicação usando Clerk para autenticação, Neon DB como banco de dados PostgreSQL e Prisma como ORM.

## 1. Configuração do Banco de Dados

### Neon DB Setup
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Copie a string de conexão do banco de dados
4. Configure a variável de ambiente `DATABASE_URL`

### Prisma Setup
```bash
# Instalar dependências do Prisma
npm install prisma @prisma/client

# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# (Opcional) Executar seed
npx prisma db seed
```

## 2. Configuração do Clerk

### Variáveis de Ambiente Necessárias
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Next.js
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Webhook Setup
1. No dashboard do Clerk, vá para "Webhooks"
2. Crie um novo webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Selecione os eventos: `user.created`, `user.updated`, `user.deleted`
4. Copie o webhook secret

## 3. Estrutura das APIs

### Rotas Disponíveis

#### Autenticação
- **Middleware**: Protege rotas que requerem autenticação
- **Webhook**: Sincroniza usuários do Clerk com o banco de dados

#### Comparações
- `GET /api/comparisons` - Buscar comparações do usuário
- `POST /api/comparisons` - Criar nova comparação
- `PUT /api/comparisons/[id]` - Atualizar comparação
- `DELETE /api/comparisons/[id]` - Deletar comparação

#### Produtos
- `GET /api/products` - Buscar todos os produtos
- `POST /api/products` - Criar novo produto
- `GET /api/products/[id]` - Buscar produto por ID
- `PUT /api/products/[id]` - Atualizar produto
- `DELETE /api/products/[id]` - Deletar produto

#### Lojas
- `GET /api/stores` - Buscar todas as lojas
- `POST /api/stores` - Criar nova loja

#### Preços
- `POST /api/product-prices` - Criar/atualizar preço do produto

#### Contribuições
- `GET /api/contributions/prices` - Buscar contribuições do usuário
- `POST /api/contributions/prices` - Criar nova contribuição
- `GET /api/contributions/daily-offers` - Buscar ofertas do dia
- `POST /api/contributions/daily-offers` - Criar nova oferta

#### Sugestões
- `GET /api/suggestions` - Buscar sugestões do usuário
- `POST /api/suggestions` - Criar nova sugestão

#### Relatórios
- `GET /api/reports/monthly` - Buscar relatórios mensais
- `POST /api/reports/monthly` - Criar/atualizar relatório mensal

#### Admin (Futuro)
- `GET /api/admin/contributions` - Buscar todas as contribuições
- `POST /api/admin/contributions/[id]/approve` - Aprovar contribuição

## 4. Integração com o Frontend

### Serviços API
Os serviços foram preparados para funcionar tanto localmente (com dados mock) quanto em produção (com APIs reais):

- `comparisonService.ts` - Gerencia comparações
- `dailyOffersService.ts` - Gerencia ofertas diárias
- `contributionService.ts` - Gerencia contribuições
- `reportsService.ts` - Gerencia relatórios

### Autenticação
O sistema usa Clerk para:
- Login/logout de usuários
- Proteção de rotas
- Sincronização automática de dados do usuário
- Tokens JWT para autenticação nas APIs

## 5. Funcionalidades Implementadas

### Ofertas Diárias
- Contribuição de preços pelos usuários
- Validação de duplicatas
- Sistema de verificação automática
- Filtragem por localização

### Comparações
- Criação e gerenciamento de comparações
- Associação de produtos e lojas
- Histórico de comparações do usuário

### Sistema de Contribuições
- Contribuições de preços com moderação
- Aprovação automática baseada em consenso
- Sistema anti-spam (um produto por usuário por loja)

### Relatórios
- Relatórios mensais de gastos
- Histórico de atividades do usuário

## 6. Próximos Passos

1. **Deploy**: Configurar deploy no Vercel ou similar
2. **Monitoramento**: Implementar logs e métricas
3. **Cache**: Adicionar cache Redis para melhor performance
4. **Notificações**: Sistema de notificações para usuários
5. **Admin Panel**: Interface administrativa para moderação

## 7. Comandos Úteis

```bash
# Resetar banco de dados
npx prisma migrate reset

# Visualizar dados
npx prisma studio

# Verificar schema
npx prisma validate

# Gerar migração
npx prisma migrate dev --name <nome-da-migração>
```

## 8. Troubleshooting

### Problemas Comuns
1. **Erro de conexão com banco**: Verificar `DATABASE_URL`
2. **Webhook não funciona**: Verificar `CLERK_WEBHOOK_SECRET`
3. **Prisma não encontra tabelas**: Executar `npx prisma migrate dev`
4. **Erro de autenticação**: Verificar keys do Clerk

### Logs Importantes
- Console do navegador para erros de frontend
- Logs do servidor para erros de API
- Logs do Clerk dashboard para problemas de autenticação
- Logs do Neon dashboard para problemas de banco
```
