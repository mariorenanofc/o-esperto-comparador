

## Tela de Marketing no Painel Administrativo

### O que será criado

Uma nova página `/admin/marketing` no painel admin com um **calendário editorial interativo** que transforma todo o conteúdo dos arquivos MD de marketing em uma interface de gerenciamento diário.

### Estrutura da Página

A página terá 4 seções principais em tabs:

**Tab 1 - Hoje (visão principal)**
- Card destaque com a tarefa do dia: formato, tema, legenda sugerida, pilar de conteúdo
- Checklist interativo (salvo em localStorage): criar arte no Canva, escrever legenda, publicar feed, publicar stories, responder comentários
- Guia rápido de design para o tipo de post do dia (cores, dimensões, fonte — extraído do guia Canva)
- Hashtags recomendadas para o pilar do dia

**Tab 2 - Calendário Semanal**
- Visão dos 7 dias da semana com cards compactos mostrando formato + tema
- Indicador visual de dias completados vs pendentes
- Navegação por semanas (anterior/próxima)

**Tab 3 - Estratégia**
- Resumo dos 4 pilares de conteúdo com percentuais
- Rotina diária de engajamento (checklist)
- Horários de pico para postagem
- Grupos de hashtags por pilar

**Tab 4 - Guia de Design**
- Paleta de cores com botão de copiar hex
- Tipografia recomendada
- Dimensões por formato (Feed, Stories, Reels, Carrossel)
- Templates de layout para cada tipo de post

### Dados do Calendário

Os dados das 52 semanas serão estruturados como um array TypeScript em um arquivo `src/data/marketingCalendar.ts`, parseando o conteúdo do MD `03-calendario-365-dias.md` em objetos:

```typescript
{ week: number, day: string, format: string, pillar: string, theme: string, caption?: string }
```

O progresso diário (concluído/pendente) será persistido em `localStorage` para não depender de banco.

### Arquivos a criar/modificar

1. **`src/data/marketingCalendar.ts`** — Dados estruturados do calendário (52 semanas, 365 posts)
2. **`src/data/marketingStrategy.ts`** — Dados da estratégia (pilares, hashtags, horários, guia de design)
3. **`src/pages/admin/Marketing.tsx`** — Página principal com as 4 tabs
4. **`src/components/admin/marketing/TodayView.tsx`** — Visão do dia com checklist
5. **`src/components/admin/marketing/WeeklyCalendar.tsx`** — Calendário semanal navegável
6. **`src/components/admin/marketing/StrategyView.tsx`** — Resumo da estratégia
7. **`src/components/admin/marketing/DesignGuide.tsx`** — Guia visual de design
8. **`src/components/AppContent.tsx`** — Adicionar rota `/admin/marketing`
9. **`src/components/admin/AdminSidebar.tsx`** — Adicionar item "Marketing" no menu
10. **`src/components/admin/AdminMobileMenu.tsx`** — Adicionar item "Marketing" no menu mobile

### Navegação

Adicionar item "Marketing" com ícone `Megaphone` no grupo "Principal" do sidebar admin, entre "Conteúdo" e "Notificações".

