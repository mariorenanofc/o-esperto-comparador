# 02 - Guia Completo de Design no Canva

## 📋 Índice

1. [Identidade Visual](#1-identidade-visual)
2. [Configuração Inicial no Canva](#2-configuração-inicial-no-canva)
3. [Dimensões e Formatos](#3-dimensões-e-formatos)
4. [Tipografia](#4-tipografia)
5. [Templates por Tipo de Post](#5-templates-por-tipo-de-post)
6. [Elementos Visuais](#6-elementos-visuais)
7. [Guia de Cores por Contexto](#7-guia-de-cores-por-contexto)
8. [Criação de Reels e Vídeos](#8-criação-de-reels-e-vídeos)
9. [Templates Prontos - Feed](#9-templates-prontos---feed)
10. [Templates Prontos - Stories](#10-templates-prontos---stories)
11. [Templates Prontos - Carrossel](#11-templates-prontos---carrossel)
12. [Capas de Reels](#12-capas-de-reels)
13. [Exportação e Qualidade](#13-exportação-e-qualidade)
14. [Banco de Elementos Reutilizáveis](#14-banco-de-elementos-reutilizáveis)

---

## 1. Identidade Visual

### Paleta de Cores Principal

| Cor | Hex | RGB | Uso Principal |
|-----|-----|-----|---------------|
| **Azul Primário** | `#4A6FA5` | 74, 111, 165 | Fundos, títulos, elementos de marca |
| **Verde Sucesso** | `#48A67D` | 72, 166, 125 | Preços baixos, economia, positivo |
| **Amarelo Alerta** | `#E8A838` | 232, 168, 56 | Ofertas, urgência, atenção |
| **Vermelho Erro** | `#D14545` | 209, 69, 69 | Preços altos, negativo, caro |
| **Roxo Hero** | `#7C5CFC` | 124, 92, 252 | CTAs, destaques, premium |
| **Rosa Accent** | `#C542A8` | 197, 66, 168 | Badges, destaques especiais |

### Paleta de Neutros

| Cor | Hex | Uso |
|-----|-----|-----|
| **Branco** | `#FFFFFF` | Textos em fundos escuros, backgrounds claros |
| **Cinza Claro** | `#F5F5F5` | Backgrounds secundários |
| **Cinza Médio** | `#9CA3AF` | Textos secundários, subtítulos |
| **Cinza Escuro** | `#374151` | Textos em fundos claros |
| **Azul Escuro** | `#0B1121` | Backgrounds escuros, contraste |
| **Preto Suave** | `#1A1A2E` | Alternativa ao preto puro |

### Gradientes (usar com moderação)

| Nome | Cores | Uso |
|------|-------|-----|
| **Primário** | `#4A6FA5` → `#7C5CFC` | Fundos de destaque |
| **Sucesso** | `#48A67D` → `#4A6FA5` | Posts de economia |
| **Urgência** | `#E8A838` → `#D14545` | Posts de oferta/urgência |
| **Premium** | `#7C5CFC` → `#C542A8` | CTAs e destaques |

---

## 2. Configuração Inicial no Canva

### Passo a Passo para Configurar a Marca

1. **Acesse** canva.com → Faça login (conta gratuita)
2. Vá em **"Kit de marca"** (Brand Kit) no menu lateral
3. Clique em **"Adicionar cores da marca"**
4. Insira cada cor hex da paleta acima
5. Adicione as **fontes** (veja seção de Tipografia)
6. Faça upload do **logo** como elemento da marca

### Criando Pasta de Templates
1. Crie uma pasta chamada **"Esperto Comparador - Templates"**
2. Dentro, crie subpastas:
   - `Feed - Posts`
   - `Stories`
   - `Reels - Capas`
   - `Carrosseis`
   - `Elementos`

---

## 3. Dimensões e Formatos

### Tabela de Dimensões

| Formato | Dimensão (px) | Proporção | Uso |
|---------|---------------|-----------|-----|
| **Feed Quadrado** | 1080 x 1080 | 1:1 | Posts padrão |
| **Feed Retrato** | 1080 x 1350 | 4:5 | Carrosséis, ocupa mais tela |
| **Stories/Reels** | 1080 x 1920 | 9:16 | Stories e capas de Reels |
| **Capa Destaque** | 1080 x 1920 | 9:16 | Capas dos destaques |
| **Foto de Perfil** | 320 x 320 | 1:1 | Avatar do perfil |

### Zonas Seguras

#### Feed (1080x1080)
```
┌────────────────────────┐
│     Margem: 60px       │
│  ┌──────────────────┐  │
│  │                  │  │
│  │  Área segura     │  │
│  │  960 x 960       │  │
│  │                  │  │
│  └──────────────────┘  │
│     Margem: 60px       │
└────────────────────────┘
```

#### Stories/Reels (1080x1920)
```
┌────────────────────────┐
│  ⚠️ Nome/foto: 200px  │  ← Evitar conteúdo aqui
│  ┌──────────────────┐  │
│  │                  │  │
│  │  Área segura     │  │
│  │  960 x 1420      │  │
│  │                  │  │
│  └──────────────────┘  │
│  ⚠️ Botões: 300px     │  ← Evitar conteúdo aqui
└────────────────────────┘
```

> **IMPORTANTE**: No Stories, evite colocar texto/elementos nos **200px superiores** (fica atrás do nome) e nos **300px inferiores** (fica atrás dos botões de resposta).

---

## 4. Tipografia

### Fontes Recomendadas (Gratuitas no Canva)

| Função | Fonte Principal | Alternativa | Peso |
|--------|----------------|-------------|------|
| **Títulos** | **Poppins** | Montserrat | Bold (700) / Extra Bold (800) |
| **Subtítulos** | **Poppins** | Montserrat | Semi Bold (600) |
| **Corpo** | **DM Sans** | Inter, Open Sans | Regular (400) / Medium (500) |
| **Números/Preços** | **Poppins** | Montserrat | Bold (700) / Extra Bold (800) |
| **CTA** | **Poppins** | Montserrat | Bold (700) |
| **Destaques** | **Poppins** | Montserrat | Extra Bold (800) / Black (900) |

### Tamanhos de Fonte por Formato

#### Feed (1080x1080)
| Elemento | Tamanho | Peso | Cor Sugerida |
|----------|---------|------|-------------|
| Título principal | 56-64px | Extra Bold | Branco ou `#0B1121` |
| Subtítulo | 36-42px | Semi Bold | Branco 80% ou `#374151` |
| Corpo | 24-28px | Regular | Branco 90% ou `#374151` |
| Números/Preços | 72-96px | Extra Bold | `#48A67D` (barato) / `#D14545` (caro) |
| CTA | 28-36px | Bold | Branco sobre `#7C5CFC` |
| Watermark | 14-16px | Regular | Branco 50% |

#### Stories (1080x1920)
| Elemento | Tamanho | Peso | Cor Sugerida |
|----------|---------|------|-------------|
| Título | 48-56px | Extra Bold | Branco |
| Subtítulo | 32-40px | Semi Bold | Branco 80% |
| Corpo | 24-32px | Regular | Branco 90% |
| Números | 64-80px | Extra Bold | `#48A67D` ou `#E8A838` |
| CTA | 28-32px | Bold | Branco |

#### Carrossel (1080x1350)
| Elemento | Tamanho | Peso | Cor Sugerida |
|----------|---------|------|-------------|
| Título (capa) | 56-64px | Extra Bold | Branco |
| Título (slides) | 42-48px | Bold | Branco ou `#0B1121` |
| Corpo | 24-28px | Regular | Branco 90% ou `#374151` |
| Números | 64-80px | Extra Bold | Cor contextual |
| Rodapé/CTA | 20-24px | Medium | `#9CA3AF` |

### Regras de Tipografia

1. **Máximo 2 fontes** por design (Poppins + DM Sans)
2. **Máximo 3 tamanhos** diferentes por slide
3. **Contraste mínimo**: Texto claro em fundo escuro ou vice-versa
4. **Espaçamento entre linhas**: 1.3x a 1.5x o tamanho da fonte
5. **Alinhamento**: Preferencialmente à esquerda ou centralizado (nunca justificado)
6. **Maiúsculas**: Usar APENAS em títulos curtos (máx. 5 palavras) e CTAs

---

## 5. Templates por Tipo de Post

### Template A - Dica de Economia (Feed 1080x1080)

```
┌─────────────────────────────┐
│ Fundo: #4A6FA5 (sólido)    │
│                             │
│  🛒 [ícone topo esquerdo]  │
│                             │
│  TÍTULO DA DICA             │
│  Poppins Extra Bold 56px    │
│  Cor: #FFFFFF               │
│                             │
│  ─── linha fina branca ──── │
│                             │
│  Texto explicativo aqui     │
│  DM Sans Regular 26px      │
│  Cor: #FFFFFF (90%)         │
│                             │
│  ┌─────────────────────┐   │
│  │  💡 CTA OU DICA     │   │
│  │  Fundo: #7C5CFC     │   │
│  │  Poppins Bold 28px  │   │
│  └─────────────────────┘   │
│                             │
│  @oespertocomparador  🛒   │
│  DM Sans 14px  Branco 50%  │
└─────────────────────────────┘
```

**No Canva - Passo a passo**:
1. Novo design → 1080x1080
2. Fundo → Cor sólida `#4A6FA5`
3. Adicionar ícone de carrinho (Elementos > "shopping cart") → canto superior esquerdo, 60px, branco, opacidade 80%
4. Texto título → Poppins Extra Bold 56px, branco, centralizado
5. Linha decorativa → Retângulo 200x2px, branco, opacidade 60%, centralizado
6. Texto corpo → DM Sans Regular 26px, branco opacidade 90%, centralizado
7. Retângulo CTA → Cantos arredondados 16px, fundo `#7C5CFC`, padding 20px
8. Texto CTA → Poppins Bold 28px, branco, centralizado dentro do retângulo
9. Watermark → DM Sans Regular 14px, branco opacidade 50%, canto inferior

### Template B - Comparação de Preços (Feed 1080x1080)

```
┌─────────────────────────────┐
│ Fundo: #0B1121              │
│                             │
│  🔍 COMPARAÇÃO DO DIA      │
│  Poppins Bold 42px          │
│  Cor: #FFFFFF               │
│                             │
│  [Produto] - [Quantidade]   │
│  DM Sans Medium 28px        │
│  Cor: #E8A838               │
│                             │
│  ┌───────────┬───────────┐ │
│  │ Mercado A  │ Mercado B  │ │
│  │ R$ XX,XX   │ R$ XX,XX   │ │
│  │ #D14545    │ #48A67D    │ │
│  └───────────┴───────────┘ │
│                             │
│  💰 ECONOMIA: R$ X,XX      │
│  Poppins Bold 36px          │
│  Cor: #48A67D               │
│                             │
│  Compare grátis → bio 🔗   │
└─────────────────────────────┘
```

**No Canva - Passo a passo**:
1. Novo design → 1080x1080
2. Fundo → `#0B1121`
3. Ícone lupa → 40px, branco, topo esquerdo
4. Título "COMPARAÇÃO DO DIA" → Poppins Bold 42px, branco
5. Nome do produto → DM Sans Medium 28px, `#E8A838`
6. Criar 2 retângulos lado a lado (colunas):
   - Retângulo esquerdo: fundo `#1A1A2E`, borda `#D14545` 2px
   - Retângulo direito: fundo `#1A1A2E`, borda `#48A67D` 2px
7. Nome do mercado → Poppins Semi Bold 24px, branco
8. Preço caro → Poppins Extra Bold 48px, `#D14545`
9. Preço barato → Poppins Extra Bold 48px, `#48A67D`
10. Economia → Poppins Bold 36px, `#48A67D`, com ícone 💰
11. CTA → DM Sans Regular 20px, branco opacidade 70%

### Template C - Enquete/Engajamento (Feed 1080x1080)

```
┌─────────────────────────────┐
│ Fundo: Gradiente             │
│ #7C5CFC → #C542A8           │
│                             │
│  🤔                         │
│  (emoji grande 80px)        │
│                             │
│  CARO OU BARATO?            │
│  Poppins Extra Bold 56px    │
│  Cor: #FFFFFF               │
│                             │
│  [Produto] por R$ XX,XX     │
│  DM Sans Medium 32px        │
│  Cor: #FFFFFF (90%)         │
│                             │
│  ┌──────┐    ┌──────┐      │
│  │ 😱   │    │ 🤑   │      │
│  │ CARO │    │ BOM! │      │
│  └──────┘    └──────┘      │
│                             │
│  COMENTA A ou B 👇          │
│  Poppins Bold 28px          │
└─────────────────────────────┘
```

**No Canva - Passo a passo**:
1. Novo design → 1080x1080
2. Fundo → Gradiente: `#7C5CFC` (topo) → `#C542A8` (base)
3. Emoji grande → Texto "🤔" tamanho 80px, centralizado no topo
4. Título → Poppins Extra Bold 56px, branco, centralizado
5. Produto + preço → DM Sans Medium 32px, branco 90%
6. 2 retângulos de opção:
   - Fundo branco 20% opacidade, cantos arredondados 20px
   - Emoji 48px + texto Poppins Bold 24px
7. CTA → Poppins Bold 28px, branco, com seta 👇

### Template D - Prova Social / Depoimento (Feed 1080x1080)

```
┌─────────────────────────────┐
│ Fundo: #FFFFFF              │
│                             │
│  ⭐⭐⭐⭐⭐                │
│                             │
│  "[Depoimento do usuário    │
│   entre aspas, itálico]"    │
│  DM Sans Italic 28px        │
│  Cor: #374151               │
│                             │
│  ─── linha ────             │
│                             │
│  👤 Nome do Usuário         │
│  DM Sans Bold 24px          │
│  📍 Cidade, Estado          │
│  DM Sans Regular 20px       │
│                             │
│  💰 Economizou R$ XXX      │
│  Poppins Bold 32px          │
│  Cor: #48A67D               │
│                             │
│  Logo + @oespertocomparador │
└─────────────────────────────┘
```

**No Canva - Passo a passo**:
1. Fundo branco `#FFFFFF`
2. Estrelas → Texto "⭐⭐⭐⭐⭐" 32px, centralizado
3. Aspas decorativas → Elementos > "quotation marks", cor `#4A6FA5`, opacidade 30%, grande (120px), atrás do texto
4. Depoimento → DM Sans Italic 28px, `#374151`, centralizado, entre aspas
5. Linha separadora → 150x2px, `#4A6FA5` opacidade 30%
6. Avatar → Círculo 50px, fundo `#4A6FA5`, ícone de pessoa branco
7. Nome → DM Sans Bold 24px, `#374151`
8. Localização → DM Sans Regular 20px, `#9CA3AF`
9. Economia → Poppins Bold 32px, `#48A67D`
10. Watermark → Logo pequeno + @ no rodapé

---

## 6. Elementos Visuais

### Ícones para Usar (buscar no Canva: Elementos)

| Categoria | Termos de Busca | Uso |
|-----------|-----------------|-----|
| Compras | "shopping cart", "grocery", "basket" | Posts de supermercado |
| Dinheiro | "money", "coins", "savings", "piggy bank" | Posts de economia |
| Comparação | "versus", "comparison", "arrows", "balance" | Posts comparativos |
| Preço | "price tag", "label", "discount" | Posts de oferta |
| Gráficos | "chart down", "decrease", "trend" | Posts de queda de preço |
| Alerta | "bell", "notification", "alert" | Posts de novidade |
| Localização | "pin", "map", "location" | Posts regionais |
| Comida | "food", "vegetables", "fruit" | Posts de produtos |

### Elementos Decorativos

| Elemento | Como Usar | Quando Usar |
|----------|-----------|-------------|
| **Círculos** | Fundo com opacidade 10-20% | Decorar cantos |
| **Linhas** | Separadores, 2px, opacidade 30-60% | Entre seções |
| **Setas** | Indicar direção, comparação | Posts comparativos |
| **Badges** | Retângulo arredondado com texto | Destacar preços, CTAs |
| **Formas orgânicas** | Blobs com opacidade 10% | Fundos dinâmicos |
| **Mockup celular** | Frame de iPhone com screenshot | Mostrar o app |
| **Estrelas** | Rating, destaque | Depoimentos |

### Mockup do App
1. No Canva, busque: **"phone mockup"** ou **"smartphone frame"**
2. Faça um screenshot do app (no navegador, 375px de largura)
3. Insira o screenshot dentro do mockup
4. Use como elemento em posts de tutorial ou prova social

### Stickers e Badges Reutilizáveis

Crie estes elementos uma vez e reutilize:

| Badge | Cor Fundo | Texto | Uso |
|-------|-----------|-------|-----|
| 🔥 OFERTA | `#D14545` | Branco Bold 20px | Posts de oferta |
| 💰 ECONOMIA | `#48A67D` | Branco Bold 20px | Posts de resultado |
| 🆕 NOVO | `#7C5CFC` | Branco Bold 20px | Features novas |
| ⚡ DICA | `#E8A838` | Branco Bold 20px | Posts educativos |
| 📊 DADOS | `#4A6FA5` | Branco Bold 20px | Posts informativos |
| 🏆 TOP | `#C542A8` | Branco Bold 20px | Rankings |

**Como criar badges no Canva**:
1. Retângulo → Cantos arredondados máximo (vira pílula)
2. Tamanho: 200x50px
3. Cor de fundo conforme tabela
4. Texto: Poppins Bold 20px, branco, centralizado
5. Emoji à esquerda do texto
6. Salvar como elemento reutilizável

---

## 7. Guia de Cores por Contexto

### Quando Usar Cada Cor

| Contexto do Post | Cor Principal | Cor Secundária | Fundo |
|-------------------|--------------|----------------|-------|
| Dica de economia | `#4A6FA5` | `#48A67D` | `#4A6FA5` ou `#0B1121` |
| Comparação | `#0B1121` | `#48A67D` + `#D14545` | `#0B1121` |
| Oferta/Promoção | `#E8A838` | `#D14545` | `#0B1121` ou gradiente |
| Engajamento | `#7C5CFC` | `#C542A8` | Gradiente roxo-rosa |
| Prova social | `#FFFFFF` | `#48A67D` | `#FFFFFF` |
| Bastidores | `#4A6FA5` | `#7C5CFC` | `#4A6FA5` |
| Tutorial | `#0B1121` | `#4A6FA5` | `#0B1121` |
| Novidade | `#7C5CFC` | `#FFFFFF` | `#7C5CFC` ou gradiente |

### Regras de Contraste

| Fundo | Texto Principal | Texto Secundário | Elementos |
|-------|----------------|-------------------|-----------|
| `#4A6FA5` | Branco | Branco 80% | Branco ou `#E8A838` |
| `#0B1121` | Branco | Branco 70% | Cores da paleta |
| `#FFFFFF` | `#0B1121` ou `#374151` | `#9CA3AF` | Cores da paleta |
| Gradiente roxo | Branco | Branco 90% | Branco |
| `#48A67D` | Branco | Branco 85% | `#FFFFFF` |

---

## 8. Criação de Reels e Vídeos

### Vídeos no Canva (Gratuito)

#### Estrutura do Reel no Canva
1. **Novo design** → "Vídeo do Instagram Reel" (1080x1920)
2. Cada **slide = 1 cena** do vídeo
3. Duração por slide: **2-4 segundos**
4. Total: **5-8 slides** = 15-30 segundos

#### Reel Tipo 1 - Comparação Rápida (15s)

| Slide | Duração | Conteúdo | Transição |
|-------|---------|----------|-----------|
| 1 | 3s | "Você está pagando CARO?" (texto grande, fundo `#D14545`) | Dissolve |
| 2 | 2s | Foto/ícone do produto + nome | Slide |
| 3 | 3s | "Mercado A: R$ XX,XX" (preço em `#D14545`) | Slide |
| 4 | 3s | "Mercado B: R$ XX,XX" (preço em `#48A67D`, com confete) | Pop |
| 5 | 2s | "ECONOMIA: R$ X,XX! 💰" (grande, fundo `#48A67D`) | Dissolve |
| 6 | 2s | "Compare grátis → link na bio" + logo | Fade |

#### Reel Tipo 2 - Dica Rápida (20s)

| Slide | Duração | Conteúdo | Animação |
|-------|---------|----------|----------|
| 1 | 3s | Hook: "PARE de perder dinheiro no mercado!" | Texto animado (typewriter) |
| 2 | 4s | "Dica 1: [texto]" + ícone | Slide da esquerda |
| 3 | 4s | "Dica 2: [texto]" + ícone | Slide da esquerda |
| 4 | 4s | "Dica 3: [texto]" + ícone | Slide da esquerda |
| 5 | 3s | "Quer mais dicas? Siga @oespertocomparador" | Pop |
| 6 | 2s | Logo + "Link na bio" | Fade |

#### Reel Tipo 3 - Antes vs Depois (15s)

| Slide | Duração | Conteúdo | Estilo |
|-------|---------|----------|--------|
| 1 | 2s | "ANTES do Esperto Comparador" | Fundo `#D14545` |
| 2 | 3s | Nota fiscal grande / valores altos | Cinza, triste |
| 3 | 2s | "DEPOIS do Esperto Comparador" | Fundo `#48A67D` |
| 4 | 3s | Nota fiscal menor / economia | Colorido, confete |
| 5 | 3s | "Economia de R$ XXX no mês! 🎉" | Celebração |
| 6 | 2s | CTA + logo | Fundo `#4A6FA5` |

### Animações no Canva

| Animação | Quando Usar | Como Aplicar |
|----------|-------------|--------------|
| **Rise** | Títulos, textos importantes | Selecionar texto → Animar → Rise |
| **Pop** | Números, preços, resultados | Destaque de valores |
| **Slide** | Listas, sequências | Itens que entram em ordem |
| **Fade** | Transições suaves | Último slide (CTA) |
| **Typewriter** | Hooks, frases impactantes | Primeiro slide |
| **Breathe** | Logos, elementos decorativos | Elementos sutis |

### Música para Reels
- **No Canva**: Áudio → Buscar músicas gratuitas
- **No Instagram**: Adicionar música trending DEPOIS de exportar do Canva
- **Dica**: Busque "trending audio reels" no Instagram antes de postar

---

## 9. Templates Prontos - Feed

### Feed Template 1: Dica do Dia
**Arquivo**: `Feed-Dica-Template.canva`

```
LAYOUT:
- Fundo: #4A6FA5 sólido
- Topo: Badge "⚡ DICA DO DIA" (pílula amarela #E8A838)
- Centro: Título em 2-3 linhas (Poppins ExtraBold 56px, branco)
- Abaixo: Explicação curta (DM Sans 26px, branco 90%)
- Rodapé: Linha fina + @oespertocomparador + 🛒

ELEMENTOS:
- Ícone temático no canto superior direito (40px, branco, opacidade 60%)
- Forma circular decorativa no canto inferior esquerdo (opacidade 10%)
```

### Feed Template 2: Preço Comparado
**Arquivo**: `Feed-Comparacao-Template.canva`

```
LAYOUT:
- Fundo: #0B1121
- Topo: "🔍 COMPARAÇÃO" (Poppins Bold 36px)
- Produto: Nome + quantidade (DM Sans 28px, #E8A838)
- Centro: 2 colunas com preços
  - Coluna esquerda: Mercado A + preço (vermelho #D14545)
  - Coluna direita: Mercado B + preço (verde #48A67D)
  - Seta "VS" entre as colunas
- Rodapé: "💰 ECONOMIZE R$ X,XX" (#48A67D)

ELEMENTOS:
- Borda colorida nas colunas (2px)
- Badge "MAIS BARATO" na coluna verde
- Seta indicando o melhor preço
```

### Feed Template 3: Dado Surpreendente
**Arquivo**: `Feed-Dado-Template.canva`

```
LAYOUT:
- Fundo: Gradiente #7C5CFC → #4A6FA5
- Centro: Número grande (Poppins ExtraBold 96px, branco)
- Abaixo: Contexto do número (DM Sans 28px, branco)
- Base: CTA ou fonte do dado

EXEMPLO:
- "40%" → "é quanto o mesmo produto pode variar entre mercados da mesma cidade"
```

### Feed Template 4: Lista/Checklist
**Arquivo**: `Feed-Lista-Template.canva`

```
LAYOUT:
- Fundo: #FFFFFF
- Topo: Título (Poppins Bold 48px, #0B1121)
- Centro: Lista com ✅ ou números
  - Cada item: DM Sans 24px, #374151
  - Ícone/emoji à esquerda de cada item
- Rodapé: CTA em badge roxo + @

ESTILO:
- Linhas sutis separando itens (opacidade 10%)
- Alternância de fundo branco e cinza claro nos itens
```

---

## 10. Templates Prontos - Stories

### Story Template 1: Bom Dia
```
LAYOUT:
- Fundo: Gradiente #4A6FA5 → #7C5CFC (diagonal)
- Centro superior: "Bom dia! ☀️" (Poppins Bold 48px, branco)
- Centro: Enquete ou pergunta
- Rodapé: "Já comparou preços hoje?"

STICKER: Enquete do Instagram (adicionar DEPOIS de postar)
```

### Story Template 2: Quiz de Preço
```
LAYOUT:
- Fundo: #0B1121
- Topo: "QUIZ 🧠" em badge #7C5CFC
- Centro: Foto do produto (imagem real ou ícone grande)
- Abaixo: "Quanto custa esse produto?"
- 2 opções lado a lado (retângulos arredondados)

STICKER: Quiz do Instagram
```

### Story Template 3: Oferta Encontrada
```
LAYOUT:
- Fundo: #0B1121
- Badge topo: "🔥 OFERTA" (#D14545)
- Produto + Preço grande (#48A67D)
- Local: "📍 [Mercado] - [Cidade]"
- Rodapé: "Mais ofertas no app → link"

STICKER: Link para o app
```

### Story Template 4: Contagem Regressiva
```
LAYOUT:
- Fundo: Gradiente #E8A838 → #D14545
- Centro: "⏰ OFERTA TERMINA HOJE"
- Produto + preço
- CTA: "Corre!"

STICKER: Countdown do Instagram
```

---

## 11. Templates Prontos - Carrossel

### Carrossel Template 1: Top 5 Dicas (6 slides - 1080x1350)

| Slide | Conteúdo | Fundo |
|-------|----------|-------|
| **Capa** | "5 DICAS para economizar no mercado 🛒" (Poppins ExtraBold 56px) + "Desliza →" | `#4A6FA5` |
| **Slide 2** | "1. [Dica]" + explicação + ícone | `#0B1121` |
| **Slide 3** | "2. [Dica]" + explicação + ícone | `#0B1121` |
| **Slide 4** | "3. [Dica]" + explicação + ícone | `#0B1121` |
| **Slide 5** | "4. [Dica]" e "5. [Dica]" | `#0B1121` |
| **Último** | CTA: "Salve, compartilhe e compare grátis → bio" + logo | Gradiente roxo |

**Estilo dos slides internos**:
- Número grande à esquerda (Poppins ExtraBold 96px, `#7C5CFC` opacidade 30%)
- Título da dica (Poppins Bold 36px, branco)
- Explicação (DM Sans Regular 24px, branco 85%)
- Ícone temático (60px, `#E8A838`)
- Barra de progresso no rodapé (5 pontos, destaque no atual)

### Carrossel Template 2: Comparativo de Mercados (8 slides)

| Slide | Conteúdo | Fundo |
|-------|----------|-------|
| **Capa** | "[Produto] em [X] mercados - qual é mais barato? 🤔" | `#0B1121` |
| **Slides 2-6** | 1 mercado por slide: Nome, preço, badge "caro"/"barato" | `#0B1121` |
| **Ranking** | Ranking do mais barato ao mais caro, com cores | `#0B1121` |
| **CTA** | "Compare QUALQUER produto grátis → bio" | `#4A6FA5` |

### Carrossel Template 3: Antes vs Depois (4 slides)

| Slide | Conteúdo | Fundo |
|-------|----------|-------|
| **Capa** | "ANTES vs DEPOIS do Esperto Comparador" | Gradiente |
| **Antes** | Valores altos, emoji triste, tom vermelho | `#D14545` 20% overlay |
| **Depois** | Valores baixos, emoji feliz, tom verde | `#48A67D` 20% overlay |
| **CTA** | Economia total + "Comece agora → bio" | `#4A6FA5` |

---

## 12. Capas de Reels

### Template de Capa (1080x1920, mas será cortado para 1080x1350 no perfil)

```
LAYOUT:
- Fundo: Cor sólida da paleta
- Centro (zona visível 1080x1350 central):
  - Título grande (Poppins ExtraBold 56px, branco)
  - Subtítulo menor (DM Sans 28px, branco 80%)
  - Emoji relevante (48px)
- Manter conteúdo principal nos 1350px centrais

REGRA: O Instagram corta as capas de Reels em 1:1 (1080x1080)
no grid do perfil. Mantenha o texto principal nessa zona central.
```

### Cores de Capa por Categoria

| Categoria | Cor de Fundo | Emoji |
|-----------|-------------|-------|
| Dicas | `#4A6FA5` | 💡 |
| Comparações | `#0B1121` | 🔍 |
| Ofertas | `#E8A838` | 🔥 |
| Resultados | `#48A67D` | 💰 |
| Engajamento | `#7C5CFC` | 🤔 |
| Tutoriais | `#4A6FA5` | 📱 |

---

## 13. Exportação e Qualidade

### Configurações de Exportação

| Formato | Tipo de Arquivo | Qualidade | Tamanho Máx. |
|---------|----------------|-----------|-------------|
| Feed (imagem) | PNG | Máxima | ~5MB |
| Stories (imagem) | PNG | Máxima | ~5MB |
| Carrossel | PNG (cada slide) | Máxima | ~5MB/slide |
| Reels (vídeo) | MP4 | 1080p | ~100MB |
| Capa de Reel | PNG | Máxima | ~5MB |

### Passo a Passo para Exportar

1. Clique em **"Compartilhar"** (canto superior direito)
2. Selecione **"Download"**
3. **Tipo de arquivo**: PNG para imagens, MP4 para vídeos
4. **Qualidade**: Marcar "Comprimir arquivo" DESMARCADO
5. Se carrossel: selecionar "Todas as páginas" como páginas separadas
6. Clicar em **"Download"**

### Nomenclatura de Arquivos
Use um padrão para organização:
```
[DATA]-[TIPO]-[TEMA].png
Exemplos:
2024-03-15-feed-dica-economia.png
2024-03-15-story-quiz-preco.png
2024-03-15-reel-comparacao-arroz.mp4
2024-03-15-carrossel-top5-slide1.png
```

---

## 14. Banco de Elementos Reutilizáveis

### Criar Uma Vez, Usar Sempre

No Canva, crie estes elementos e salve como **"Favoritos"** ou em uma página dedicada:

#### Logos e Watermarks
| Elemento | Especificação |
|----------|---------------|
| Logo branco (fundo transparente) | Para fundos escuros |
| Logo colorido (fundo transparente) | Para fundos claros |
| Watermark `@oespertocomparador` | DM Sans 14px, branco 50% |
| Watermark com logo | Logo 20px + @ 14px |

#### Badges Prontos
| Badge | Tamanho | Fonte |
|-------|---------|-------|
| "🔥 OFERTA" sobre `#D14545` | 180x45px | Poppins Bold 18px |
| "💰 ECONOMIA" sobre `#48A67D` | 200x45px | Poppins Bold 18px |
| "🆕 NOVO" sobre `#7C5CFC` | 140x45px | Poppins Bold 18px |
| "⚡ DICA" sobre `#E8A838` | 150x45px | Poppins Bold 18px |
| "📊 DADOS" sobre `#4A6FA5` | 160x45px | Poppins Bold 18px |
| "🏆 TOP" sobre `#C542A8` | 130x45px | Poppins Bold 18px |
| "MAIS BARATO ✅" sobre `#48A67D` | 220x45px | Poppins Bold 18px |
| "MAIS CARO ❌" sobre `#D14545` | 200x45px | Poppins Bold 18px |

#### Fundos Reutilizáveis
| Fundo | Especificação |
|-------|---------------|
| Sólido azul | `#4A6FA5`, 1080x1080 e 1080x1920 |
| Sólido escuro | `#0B1121`, 1080x1080 e 1080x1920 |
| Gradiente roxo | `#7C5CFC` → `#C542A8`, diagonal |
| Gradiente azul | `#4A6FA5` → `#7C5CFC`, diagonal |
| Gradiente urgência | `#E8A838` → `#D14545`, diagonal |

#### CTA Buttons
| CTA | Especificação |
|-----|---------------|
| "Compare grátis →" | Retângulo arredondado `#7C5CFC`, Poppins Bold 24px, branco |
| "Link na bio 🔗" | Retângulo arredondado `#48A67D`, Poppins Bold 24px, branco |
| "Salve esse post 🔖" | Retângulo arredondado `#E8A838`, Poppins Bold 24px, branco |
| "Desliza →" | Retângulo arredondado `#4A6FA5`, Poppins Bold 24px, branco |

---

## Resumo Rápido de Design

| Regra | Detalhe |
|-------|---------|
| **Fontes** | Poppins (títulos) + DM Sans (corpo) |
| **Cores** | Máx. 3 cores por design |
| **Contraste** | Texto claro em fundo escuro e vice-versa |
| **Espaçamento** | Margem mín. 60px das bordas |
| **Hierarquia** | 3 níveis: título > subtítulo > corpo |
| **Logo** | Sempre presente, discreto (watermark) |
| **CTA** | Sempre presente no último slide/na base |
| **Consistência** | Mesmo estilo visual em TODOS os posts |
