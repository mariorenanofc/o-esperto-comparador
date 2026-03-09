export interface ContentPillar {
  name: string;
  percentage: number;
  icon: string;
  color: string;
  description: string;
  examples: string[];
}

export interface PostingTime {
  day: string;
  best: string;
  second: string;
  reason: string;
}

export interface HashtagGroup {
  name: string;
  tags: string[];
}

export interface DesignColor {
  name: string;
  hex: string;
  usage: string;
  category: "primary" | "neutral" | "gradient";
}

export interface FontSpec {
  role: string;
  font: string;
  alternative: string;
  weight: string;
}

export interface FormatDimension {
  name: string;
  width: number;
  height: number;
  ratio: string;
  usage: string;
}

export const contentPillars: ContentPillar[] = [
  {
    name: "Educativo",
    percentage: 40,
    icon: "📚",
    color: "hsl(var(--primary))",
    description: "Posicionar como autoridade em economia doméstica",
    examples: [
      "5 produtos mais baratos no atacarejo",
      "Preço por kg: a métrica que muda compras",
      "Erros que fazem gastar mais",
      "Marcas próprias vs famosas",
      "Como montar lista inteligente",
    ],
  },
  {
    name: "Engajamento",
    percentage: 25,
    icon: "🎯",
    color: "hsl(var(--chart-4))",
    description: "Aumentar interação e alcance orgânico",
    examples: [
      "Enquete: Quanto você paga no arroz?",
      "CARO ou BARATO?",
      "Desafio: gaste < R$200 no mês",
      "Tag quem reclama dos preços 😂",
      "Votação: qual produto comparar?",
    ],
  },
  {
    name: "Prova Social",
    percentage: 20,
    icon: "⭐",
    color: "hsl(var(--chart-2))",
    description: "Gerar confiança e downloads",
    examples: [
      "Maria economizou R$127 no mês!",
      "+500 contribuições da comunidade 🎉",
      "Print de economia real",
      "Antes vs Depois do app",
      "Cases reais de economia",
    ],
  },
  {
    name: "Bastidores",
    percentage: 15,
    icon: "🔧",
    color: "hsl(var(--chart-5))",
    description: "Humanizar a marca e criar conexão",
    examples: [
      "Nova feature: alertas de preço! 🔔",
      "A história do Esperto Comparador",
      "O que a comunidade pediu → entregamos",
      "Como validamos os preços",
      "Dia a dia do desenvolvimento",
    ],
  },
];

export const postingTimes: PostingTime[] = [
  { day: "Segunda", best: "7h-8h / 12h-13h", second: "19h-20h", reason: "Planejamento da semana" },
  { day: "Terça", best: "11h-12h / 18h-19h", second: "21h", reason: "Meio da semana, rotina" },
  { day: "Quarta", best: "12h-13h / 19h-20h", second: "7h-8h", reason: "Meio de semana, compras" },
  { day: "Quinta", best: "7h-8h / 12h-13h", second: "20h-21h", reason: "Pré-compras fim de semana" },
  { day: "Sexta", best: "11h-12h / 17h-18h", second: "20h", reason: "Véspera de compras" },
  { day: "Sábado", best: "9h-10h / 14h-15h", second: "20h", reason: "Dia de compras!" },
  { day: "Domingo", best: "10h-11h / 16h-17h", second: "19h-20h", reason: "Planejamento semanal" },
];

export const hashtagGroups: HashtagGroup[] = [
  {
    name: "Economia Doméstica",
    tags: ["#economiadomestica", "#dicasdeeconomia", "#economizar", "#planejamentofinanceiro", "#educacaofinanceira", "#poupar", "#comprainteligente", "#supermercado", "#precobaixo", "#gastarmenos"],
  },
  {
    name: "Comparação de Preços",
    tags: ["#comparadordeprecos", "#melhorpreco", "#preçobom", "#preçojusto", "#pesquisadepreco", "#supermercadooferta", "#atacarejo", "#cestabásica", "#consumoconsciente", "#compraesperta"],
  },
  {
    name: "App/Tecnologia",
    tags: ["#app", "#aplicativo", "#appgratuito", "#tecnologia", "#inovacao", "#startup", "#startupbrasileira", "#webapp", "#comunidade", "#colaborativo"],
  },
  {
    name: "Engajamento",
    tags: ["#dicadodia", "#vocêsabia", "#curiosidade", "#desafio", "#enquete", "#compartilhe", "#marqueumamigo", "#conteudoutil", "#paraeconomizar"],
  },
];

export const designColors: DesignColor[] = [
  { name: "Azul Primário", hex: "#4A6FA5", usage: "Fundos, títulos, marca", category: "primary" },
  { name: "Verde Sucesso", hex: "#48A67D", usage: "Preços baixos, economia", category: "primary" },
  { name: "Amarelo Alerta", hex: "#E8A838", usage: "Ofertas, urgência", category: "primary" },
  { name: "Vermelho Erro", hex: "#D14545", usage: "Preços altos, caro", category: "primary" },
  { name: "Roxo Hero", hex: "#7C5CFC", usage: "CTAs, destaques", category: "primary" },
  { name: "Rosa Accent", hex: "#C542A8", usage: "Badges especiais", category: "primary" },
  { name: "Branco", hex: "#FFFFFF", usage: "Textos em fundos escuros", category: "neutral" },
  { name: "Cinza Claro", hex: "#F5F5F5", usage: "Backgrounds secundários", category: "neutral" },
  { name: "Azul Escuro", hex: "#0B1121", usage: "Backgrounds escuros", category: "neutral" },
  { name: "Preto Suave", hex: "#1A1A2E", usage: "Alternativa ao preto", category: "neutral" },
];

export const fontSpecs: FontSpec[] = [
  { role: "Títulos", font: "Poppins", alternative: "Montserrat", weight: "Bold (700) / Extra Bold (800)" },
  { role: "Subtítulos", font: "Poppins", alternative: "Montserrat", weight: "Semi Bold (600)" },
  { role: "Corpo", font: "DM Sans", alternative: "Inter, Open Sans", weight: "Regular (400) / Medium (500)" },
  { role: "Números/Preços", font: "Poppins", alternative: "Montserrat", weight: "Bold (700) / Extra Bold (800)" },
  { role: "CTA", font: "Poppins", alternative: "Montserrat", weight: "Bold (700)" },
];

export const formatDimensions: FormatDimension[] = [
  { name: "Feed Quadrado", width: 1080, height: 1080, ratio: "1:1", usage: "Posts padrão" },
  { name: "Feed Retrato", width: 1080, height: 1350, ratio: "4:5", usage: "Carrosséis" },
  { name: "Stories/Reels", width: 1080, height: 1920, ratio: "9:16", usage: "Stories e Reels" },
  { name: "Capa Destaque", width: 1080, height: 1920, ratio: "9:16", usage: "Capas dos destaques" },
  { name: "Foto Perfil", width: 320, height: 320, ratio: "1:1", usage: "Avatar" },
];

export const dailyChecklist = [
  { period: "Manhã (15 min)", tasks: [
    "Postar 1-2 stories de bom dia + enquete",
    "Verificar DMs e responder",
    "Interagir com 5 perfis do nicho",
  ]},
  { period: "Meio do Dia (20 min)", tasks: [
    "Publicar post do feed (conforme calendário)",
    "Postar 2-3 stories com conteúdo",
    "Responder comentários do post",
  ]},
  { period: "Tarde (15 min)", tasks: [
    "Interagir com mais 5-10 perfis",
    "Postar stories interativos (quiz, enquete)",
    "Verificar DMs novamente",
  ]},
  { period: "Noite (10 min)", tasks: [
    "Stories de boa noite + resumo do dia",
    "Analisar métricas do post",
    "Planejar conteúdo do dia seguinte",
  ]},
];

export const engagementRoutine = [
  "30 min ANTES de postar: interagir com 10-15 perfis do nicho",
  "30 min DEPOIS de postar: responder TODOS os comentários e DMs",
  "Comentar com VALOR em posts de perfis grandes do nicho",
  "Usar stickers interativos em TODOS os stories",
  "Repostar UGC (conteúdo gerado pelos usuários) nos stories",
];

export const monthlyGoals = [
  { month: 1, followers: "500", engagement: ">5%", reach: "200-500" },
  { month: 2, followers: "1.500", engagement: ">5%", reach: "500-1.000" },
  { month: 3, followers: "3.000", engagement: ">4%", reach: "1.000-3.000" },
  { month: 4, followers: "5.000", engagement: ">4%", reach: "2.000-5.000" },
  { month: 5, followers: "7.000", engagement: ">3.5%", reach: "3.000-7.000" },
  { month: 6, followers: "10.000", engagement: ">3.5%", reach: "5.000-10.000" },
  { month: "7-9", followers: "15.000", engagement: ">3%", reach: "7.000-15.000" },
  { month: "10-12", followers: "25.000", engagement: ">3%", reach: "10.000-25.000" },
];
