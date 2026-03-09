

## Melhorias no Footer: Compacto no Mobile + Carregamento Correto

### Problemas Identificados

1. **Footer extenso no mobile**: 4 colunas empilhadas verticalmente criam um footer enorme em telas pequenas (grid-cols-1 gera ~4 blocos longos).
2. **Footer aparece antes do conteudo**: O Footer esta fora do `<Suspense>` (linha 62 do AppContent), entao renderiza instantaneamente enquanto as paginas lazy-loaded ainda carregam.
3. **framer-motion no Footer**: Animacoes pesadas desnecessarias para um footer.

### Plano de Implementacao

**1. Footer compacto no mobile**
- Substituir o grid 4-colunas por um layout colapsavel no mobile usando `Collapsible` do Radix
- No mobile: mostrar apenas brand + copyright + links em linha horizontal compacta (sem colunas separadas para Navegacao/Ferramentas/Info)
- Links agrupados em 2 linhas horizontais com separadores, sem icones no mobile
- Remover animacoes framer-motion completamente (peso desnecessario para footer)
- Manter layout 4-colunas apenas para `lg:` breakpoint

**2. Footer dentro do Suspense**
- Mover o `<Footer />` para dentro do `<Suspense>` boundary, apos as `<Routes>`, para que carregue junto com o conteudo da pagina e nao antes
- Estrutura: `<Suspense fallback={PageFallback}><Routes>...</Routes><Footer /></Suspense>`

**Resultado esperado**: Footer de ~3 linhas no mobile (brand, links inline, copyright) vs o bloco atual de ~20+ linhas. Footer so aparece quando a pagina termina de carregar.

