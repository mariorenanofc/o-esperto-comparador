# 12 - Issues Abertas

## 🔥 Críticas (P0)

### Performance
- **Busca lenta de produtos** - Queries demoram >2s
  - **Impacto**: UX degradada, abandono de usuários
  - **ETA**: Sprint atual
  - **Owner**: Backend Team

### Cache
- **Invalidação incorreta** - Dados desatualizados exibidos
  - **Impacto**: Preços incorretos mostrados
  - **ETA**: Sprint atual  
  - **Owner**: Frontend Team

## ⚠️ Importantes (P1)

### Mobile UX
- **Layout quebrado** - Algumas telas não responsivas
  - **Páginas afetadas**: Admin, Relatórios
  - **ETA**: Próxima sprint

### Error Handling
- **Mensagens genéricas** - Usuários não sabem como proceder
  - **Componentes**: Forms, API calls
  - **ETA**: Próxima sprint

## 📋 Menores (P2)

- [ ] Loading states inconsistentes
- [ ] Toast messages não padronizadas  
- [ ] Acessibilidade - falta alt text
- [ ] SEO - meta tags faltando

## 📈 Backlog Técnico

- [ ] Migração para React 19
- [ ] Upgrade Supabase v2.50+
- [ ] Implementar Service Worker v2
- [ ] Otimizar bundle size
- [ ] Adicionar Storybook
- [ ] Setup CI/CD completo