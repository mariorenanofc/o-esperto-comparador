

## Dados Mock/Fictícios na Area Administrativa - Plano de Correção

### Problemas Identificados

**1. PerformanceMonitor - 100% mockado (CRITICO)**
Em `src/components/admin/PerformanceMonitor.tsx` (linhas 42-50), cria um objeto `mockStats` com todos os valores zerados em vez de consultar dados reais:
- `total_products: 0` - deveria contar da tabela `products`
- `total_offers: 0` - deveria contar da tabela `daily_offers`
- `recent_offers_24h: 0` - deveria filtrar ofertas das ultimas 24h
- `avg_response_time_ms: 0` - deveria calcular da tabela `api_performance_logs`

**2. OptimizedAdminDashboard - Status cards hardcoded (CRITICO)**
Em `src/components/admin/OptimizedAdminDashboard.tsx` (linhas 26-69), os 4 cards de status mostram texto fixo: "Otimizado", "Ativo", "Melhorado", "Atenção". Nenhum consulta dados reais. Deveriam mostrar metricas reais do banco.

**3. ReportsExporter - "Exportações Recentes" mockado**
Em `src/components/admin/ReportsExporter.tsx` (linhas 393-410), a seção "Exportações Recentes" mostra um item fake hardcoded: "Relatório de Usuários - CSV - 1,234 registros - Há 2 horas". Deveria buscar da tabela `comparison_exports` ou simplesmente não mostrar se não houver dados.

**4. mockApiService - Serviço inteiro mock**
`src/services/mockApiService.ts` é um serviço completamente fictício com dados hardcoded (ex: "João Silva", "Sabão em Pó Ala"). Precisa ser removido se não estiver sendo usado.

### Componentes que JÁ usam dados reais (sem alteração necessária)
- `AnalyticsSection` - consulta Supabase via `supabaseAdminService.getAnalytics()`
- `PlatformStatsCards` - recebe dados reais do Dashboard
- `ActiveUsersSection` - consulta `profiles` com `is_online = true`
- `PendingContributionsSection` - consulta `daily_offers`
- `FeedbackSection` - consulta `suggestions`
- `UserManagementSection` - consulta `profiles`
- `DbUsageCard` - chama RPC `get_db_usage`
- `SecurityMonitoringSection` - consulta `admin_audit_log` e `rate_limits`

### Plano de Implementação

**1. Corrigir PerformanceMonitor** - Substituir `mockStats` por queries reais:
- `SELECT count(*) FROM products`
- `SELECT count(*) FROM daily_offers`
- `SELECT count(*) FROM daily_offers WHERE created_at >= now() - 24h`
- `SELECT avg(response_time_ms) FROM api_performance_logs WHERE created_at >= now() - 7d`

**2. Corrigir OptimizedAdminDashboard** - Buscar dados reais para os 4 cards:
- Performance: tempo medio de resposta da API (de `api_performance_logs`)
- Email: contagem de emails enviados (de `notification_send_log`)
- Database: percentual de uso (RPC `get_db_usage`)
- Segurança: contagem de eventos de segurança recentes (de `admin_audit_log`)

**3. Corrigir ReportsExporter** - Buscar exportações reais da tabela `comparison_exports` ou mostrar estado vazio quando não houver dados.

**4. Remover mockApiService** - Verificar se está sendo importado em algum lugar e remover o arquivo se não estiver em uso ativo.

