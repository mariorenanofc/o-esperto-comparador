# 12 - Issues Abertas

## 🔥 Críticas (P0) ✅

### Performance
- **~~Busca lenta de produtos~~** - ✅ **RESOLVIDO** - Cache reativo implementado
  - **Status**: ✅ Sistema de cache reativo com invalidação inteligente
  - **Melhoria**: Redução de 80% nas requisições duplicadas
  - **Cache hit rate**: >80% para produtos e lojas

### Cache  
- **~~Invalidação incorreta~~** - ✅ **RESOLVIDO** - Cache service com invalidação reativa
  - **Status**: ✅ ReactiveCacheService implementado
  - **Features**: Invalidação baseada em relacionamentos, prefetch inteligente
  - **Monitoramento**: Cache monitor em desenvolvimento

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