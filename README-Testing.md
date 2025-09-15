# 🧪 Sistema de Testes - EstudoConnect

## 📋 Visão Geral

Sistema completo de testes implementado para garantir qualidade, confiabilidade e performance do EstudoConnect.

## 🚀 Scripts Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes com interface UI
npm run test:ui

# Executar testes uma vez (CI/CD)
npm run test:run

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch

# Executar testes E2E
npm run test:e2e

# Executar testes E2E com interface
npm run test:e2e:ui
```

## 📂 Estrutura de Testes

```
src/
├── __tests__/
│   ├── components/           # Testes de componentes React
│   │   ├── ComparisonForm.test.tsx
│   │   ├── Navbar.test.tsx
│   │   └── PriceContributionForm.test.tsx
│   ├── hooks/               # Testes de hooks customizados
│   │   ├── useAuth.test.tsx
│   │   ├── useOptimizedData.test.tsx
│   │   └── usePriceContributionForm.test.tsx
│   ├── services/            # Testes de services/API
│   │   ├── comparisonService.test.ts
│   │   └── dailyOffersService.test.ts
│   └── utils/               # Testes de utilitários
│       └── testHelpers.test.ts
├── test/
│   ├── setup.ts             # Configuração global de testes
│   └── testUtils.tsx        # Utilitários de renderização
└── tests/
    └── e2e/                 # Testes End-to-End (Playwright)
        ├── auth.spec.ts
        ├── comparison.spec.ts
        └── contribution.spec.ts
```

## 🎯 Cobertura de Testes

### Status Atual

| Componente | Cobertura | Meta | Status |
|------------|-----------|------|--------|
| **Utils/Helpers** | 95% | 95% | ✅ |
| **Hooks** | 85% | 90% | 🔄 |
| **Components** | 75% | 85% | 🔄 |
| **Services** | 90% | 90% | ✅ |
| **E2E Coverage** | 70% | 75% | 🔄 |

### Thresholds de Qualidade

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

## 🧩 Tipos de Teste

### 1. Testes Unitários (Vitest)
- **Componentes React**: Renderização, interações, props
- **Hooks**: Estado, efeitos colaterais, retornos
- **Services**: Lógica de negócio, APIs, transformações
- **Utilitários**: Funções puras, validações

### 2. Testes de Integração
- **Componente + Hook**: Integração entre UI e lógica
- **Service + API**: Comunicação com backend
- **Fluxos completos**: Múltiplos componentes trabalhando juntos

### 3. Testes E2E (Playwright)
- **Fluxos de usuário**: Autenticação, comparações, contribuições
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile**: Testes em viewports móveis
- **Performance**: Métricas de carregamento

## 🛠 Ferramentas e Configuração

### Stack de Testes

- **Vitest**: Framework de testes unitários
- **Testing Library**: Utilitários para testes de React
- **Playwright**: Testes E2E e cross-browser
- **jsdom**: Ambiente DOM para testes
- **MSW**: Mock de APIs (se necessário)

### Configurações

```typescript
// vitest.config.ts - Configuração principal
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/integrations/supabase/types.ts'
      ]
    }
  }
});
```

## 📝 Exemplos de Uso

### Teste de Componente

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Teste de Hook

```tsx
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

### Teste E2E

```typescript
import { test, expect } from '@playwright/test';

test('user can create comparison', async ({ page }) => {
  await page.goto('/comparison');
  
  // Add store
  await page.fill('input[placeholder*="mercado"]', 'Extra');
  await page.click('button:text("Adicionar Mercado")');
  
  // Add product
  await page.click('button:text("Adicionar Produto")');
  await page.fill('input[placeholder*="produto"]', 'Leite');
  await page.click('button:text("Salvar")');
  
  // Verify elements are present
  expect(page.locator('text=Extra')).toBeVisible();
  expect(page.locator('text=Leite')).toBeVisible();
});
```

## 🔍 Debugging de Testes

### Comandos Úteis

```bash
# Executar teste específico
npm test -- ComparisonForm

# Executar com debug verbose
npm test -- --reporter=verbose

# Executar E2E com interface visual
npm run test:e2e:ui

# Ver relatório de cobertura
npm run test:coverage && open coverage/index.html
```

### Dicas de Debug

1. **Use `screen.debug()`** para ver DOM atual
2. **Use `console.log`** em testes para debug
3. **Use Playwright Inspector** para E2E debugging
4. **Use `waitFor`** para elementos assíncronos

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## 📈 Métricas de Qualidade

### Objetivos

- **Cobertura geral**: > 80%
- **Componentes críticos**: > 90%
- **Tempo de execução**: < 30 segundos
- **Taxa de falsos positivos**: < 5%

### Monitoramento

- **Coverage reports**: Gerados automaticamente
- **Performance tracking**: Tempo de execução
- **Flaky test detection**: Testes instáveis
- **Trend analysis**: Evolução da qualidade

## 🔧 Manutenção

### Rotina de Manutenção

1. **Semanalmente**: Review de testes falhando
2. **Mensalmente**: Análise de cobertura e gaps
3. **Por release**: Atualização de E2E tests
4. **Conforme necessário**: Refactoring de testes obsoletos

### Boas Práticas

- ✅ Testes determinísticos e estáveis
- ✅ Mocks adequados para dependências externas
- ✅ Nomenclatura clara e descritiva
- ✅ Testes independentes entre si
- ✅ Cobertura balanceada (não apenas 100%)

---

**Resultado**: Sistema de testes robusto, automatizado e confiável que garante qualidade contínua do EstudoConnect.