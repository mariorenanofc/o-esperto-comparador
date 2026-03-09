export interface MarketingDay {
  week: number;
  dayOfWeek: string;
  format: string;
  formatEmoji: string;
  pillar: string;
  theme: string;
  caption?: string;
}

export interface MarketingWeek {
  week: number;
  month: number;
  focus: string;
  days: MarketingDay[];
}

const dayThemes = [
  { dayOfWeek: "Segunda", pillar: "Educativo", theme: "Segunda de Economia", formatEmoji: "🎠", format: "Carrossel" },
  { dayOfWeek: "Terça", pillar: "Educativo", theme: "Terça de Dica", formatEmoji: "🎬", format: "Reel" },
  { dayOfWeek: "Quarta", pillar: "Prova Social", theme: "Quarta Comparativa", formatEmoji: "📸", format: "Post Feed" },
  { dayOfWeek: "Quinta", pillar: "Bastidores", theme: "Quinta de Bastidores", formatEmoji: "📸", format: "Post/Stories" },
  { dayOfWeek: "Sexta", pillar: "Engajamento", theme: "Sexta de Oferta", formatEmoji: "📸", format: "Post + Stories" },
  { dayOfWeek: "Sábado", pillar: "Engajamento", theme: "Sábado Interativo", formatEmoji: "📸", format: "Enquete/Quiz" },
  { dayOfWeek: "Domingo", pillar: "Educativo", theme: "Domingo de Planejamento", formatEmoji: "🎠", format: "Checklist" },
];

// Detailed weeks with specific content ideas
const weeklyContent: { week: number; month: number; focus: string; themes: string[] }[] = [
  // Month 1
  { week: 1, month: 1, focus: "Apresentação da Marca", themes: [
    "Quem somos: O Esperto Comparador", "Você sabia que o mesmo produto pode custar 40% mais?", "Primeira comparação real de preços",
    "Por que criamos o Esperto Comparador", "Oferta encontrada pela comunidade!", "Quanto você paga no arroz 5kg? 🤔", "Como planejar suas compras da semana"
  ]},
  { week: 2, month: 1, focus: "Educação sobre Economia", themes: [
    "5 erros que fazem você gastar mais no mercado", "Dica: sempre olhe o preço por kg/litro", "Comparação: óleo de soja em 3 mercados",
    "Bastidores: como validamos os preços", "🔥 Top 3 ofertas do dia", "CARO ou BARATO? Leite 1L por R$5,49", "Lista de compras inteligente"
  ]},
  { week: 3, month: 1, focus: "Prova Social e Comunidade", themes: [
    "Como economizar R$100/mês no supermercado", "Tutorial: como comparar preços no app", "Comparação semanal: café 500g",
    "Já são [X] contribuições de preço! 🎉", "Oferta relâmpago encontrada!", "Desafio: gaste menos de R$150 essa semana", "Guia: monte sua feira semanal econômica"
  ]},
  { week: 4, month: 1, focus: "Consolidação", themes: [
    "Marca própria vs marca famosa: vale a pena?", "3 produtos que SEMPRE são mais baratos no atacarejo", "Comparação: cesta básica em 2 mercados",
    "Nova feature: [recurso novo do app]", "Resumo da semana: melhores ofertas", "Quiz: qual produto teve maior variação?", "Retrospectiva do mês"
  ]},
  // Month 2
  { week: 5, month: 2, focus: "Engajamento e Crescimento", themes: [
    "7 alimentos que subiram de preço este mês", "POV: Você descobre que pagou 40% mais caro 😱", "Comparação: açúcar 5kg em 4 mercados",
    "O pedido mais feito pelos usuários", "🔥 Oferta: [produto] por apenas R$ X,XX", "Isso ou aquilo? Marca A vs Marca B", "Como ler promoção sem cair em pegadinha"
  ]},
  { week: 6, month: 2, focus: "Conteúdo Viral", themes: [
    "Produtos que NUNCA vale comprar na promoção", "Speed run: comparando 5 preços em 30 segundos", "Comparação: produtos de limpeza",
    "A comunidade falou, a gente ouviu", "As 5 ofertas que nossos usuários mais amaram", "Votação: qual produto comparar semana que vem?", "Domingo de organização"
  ]},
  { week: 7, month: 2, focus: "Storytelling", themes: [
    "Compras do mês vs semanais: qual sai mais barato?", "Minha mãe não acreditou na economia 😂", "Comparação: higiene pessoal",
    "Como nasce uma feature nova", "Oferta bomba: [produto] com [X]% de desconto", "Tag alguém que reclama dos preços 😂", "Checklist: itens essenciais para a dispensa"
  ]},
  { week: 8, month: 2, focus: "Dados e Análise", themes: [
    "Inflação do mês: o que subiu e o que desceu", "Antes vs Depois de usar o Esperto Comparador", "Comparação: carnes",
    "Marco: [X] usuários economizaram!", "Resumo do mês: top ofertas", "Enquete: melhor supermercado da sua cidade?", "Retrospectiva Mês 2"
  ]},
  // Month 3
  { week: 9, month: 3, focus: "Autoridade no Nicho", themes: [
    "Guia definitivo: cesta básica econômica", "Fui em 3 mercados e olha a diferença 😱", "Comparação: produtos para bebê",
    "Collab: dicas com @[influencer]", "Frutas e verduras da estação", "Desafio: refeição por menos de R$15", "Receitas baratas: 5 jantares < R$10"
  ]},
  { week: 10, month: 3, focus: "Conteúdo Avançado", themes: [
    "Horários secretos de promoção", "O supermercado NÃO quer que você saiba disso", "Comparação: material escolar/limpeza",
    "Dados que descobrimos sobre preços", "As 3 melhores ofertas da semana", "Qual produto quer que a gente compare?", "Dica: congele e economize"
  ]},
  { week: 11, month: 3, focus: "Viralização", themes: [
    "5 substitutos mais baratos para produtos caros", "Reação: supermercado A vs B", "Comparação: bebidas",
    "O que vocês pediram → entregamos", "Mega oferta: [produto popular]", "Quiz: acerte o preço!", "Planejamento mensal: template gratuito"
  ]},
  { week: 12, month: 3, focus: "Retrospectiva Trimestral", themes: [
    "Dados de economia da comunidade", "3 meses: resultados reais", "Comparação especial: cesta completa 10+ itens",
    "Obrigado comunidade!", "Top 10 ofertas do trimestre", "Enquete: o que melhorar no app?", "Metas do próximo trimestre"
  ]},
  // Months 4-6
  { week: 13, month: 4, focus: "Dia do Consumidor", themes: [
    "Seus direitos como consumidor", "Dica: como reclamar de preço errado", "Comparação especial: mais pedidos", "Consumidor informado economiza mais", "Ofertas especiais da data", "Quiz: direitos do consumidor", "Planejamento pós-data"
  ]},
  { week: 14, month: 4, focus: "Mitos vs Verdades", themes: [
    "Mitos sobre promoções", "Verdade: dia de promoção de cada mercado", "Comparação: mitos desmentidos com dados", "Como verificamos preços", "Oferta real vs pegadinha", "Verdade ou mentira?", "Resumo de mitos"
  ]},
  { week: 15, month: 4, focus: "Análise por Mercado", themes: [
    "Mercado X: vale a pena?", "Tour de preços no atacarejo", "Comparação: mesmos produtos em 3 redes", "Por dentro de uma rede de supermercados", "Melhores ofertas da rede X", "Qual rede você prefere?", "Ranking de mercados do mês"
  ]},
  { week: 16, month: 4, focus: "Páscoa", themes: [
    "Ovos de Páscoa: onde é mais barato?", "DIY: ovo caseiro vs comprado", "Comparação: chocolates por marca", "Como economizar na Páscoa", "Ofertas de Páscoa", "Qual ovo preferido?", "Pós-Páscoa: chocolates com desconto"
  ]},
  { week: 17, month: 5, focus: "Dia das Mães", themes: [
    "Presente sem gastar muito", "Dica: almoço especial econômico", "Comparação: ingredientes para receita especial", "História: mães que economizam", "Ofertas para o Dia das Mães", "Presente ideal: vote!", "Receita especial + lista de compras"
  ]},
  { week: 18, month: 5, focus: "Churrasco Econômico", themes: [
    "Guia do churrasco econômico", "Cortes baratos que são deliciosos", "Comparação: carnes para churrasco", "Preparação: quantidades certas", "Ofertas de carne da semana", "Melhor corte custo-benefício?", "Lista completa do churrasco"
  ]},
  { week: 19, month: 5, focus: "Produto da Semana", themes: [
    "Deep dive: arroz", "Tudo sobre variações de preço", "Comparação: todas as marcas", "Como escolhemos o produto da semana", "Melhor oferta do produto", "Qual produto analisar?", "Resumo: guia definitivo do produto"
  ]},
  { week: 20, month: 5, focus: "Economia no Inverno", themes: [
    "Sopas e caldos baratos", "Dica: alimentos quentes econômicos", "Comparação: ingredientes de inverno", "Receitas que aquecem e economizam", "Ofertas de inverno", "Sua receita de inverno favorita?", "Cardápio semanal de inverno"
  ]},
  { week: 21, month: 6, focus: "Festa Junina", themes: [
    "Itens de festa junina: onde é mais barato?", "DIY: decoração econômica", "Comparação: milho, amendoim, etc.", "Tradições juninas", "Ofertas juninas", "Comida junina favorita?", "Lista completa da festa"
  ]},
  { week: 22, month: 6, focus: "Revisão Semestral", themes: [
    "Meio do ano: revisão de gastos", "Dica: como ajustar orçamento", "Comparação: evolução de preços no semestre", "Números do semestre", "Melhores ofertas dos 6 meses", "O que aprendeu de economia?", "Metas para o 2º semestre"
  ]},
  { week: 23, month: 6, focus: "Dia dos Namorados", themes: [
    "Jantar romântico por menos de R$50", "Dicas de presente econômico", "Comparação: vinhos e espumantes", "Casais que economizam juntos", "Ofertas para o jantar", "Programa econômico favorito?", "Receita romântica + lista"
  ]},
  { week: 24, month: 6, focus: "Retrospectiva Semestral", themes: [
    "6 meses: quanto a comunidade economizou", "Lições do primeiro semestre", "Comparação: cesta básica jan vs jun", "Agradecimento à comunidade", "Top ofertas do semestre", "O que melhorar?", "Planos para o 2º semestre"
  ]},
  // Months 7-9
  { week: 25, month: 7, focus: "Férias Escolares", themes: [
    "Alimentação econômica para crianças", "Lanches baratos e saudáveis", "Comparação: snacks infantis", "Receitas para fazer com crianças", "Ofertas para famílias", "Lanche favorito das crianças?", "Cardápio de férias"
  ]},
  { week: 26, month: 7, focus: "Preços por Região", themes: [
    "Preços no Sudeste vs Nordeste", "Por que preços variam entre estados?", "Comparação: mesmos produtos em cidades diferentes", "Dados regionais surpreendentes", "Melhores ofertas por região", "De onde você é?", "Mapa de preços do Brasil"
  ]},
  { week: 27, month: 7, focus: "Desafio 30 Dias", themes: [
    "Desafio: economize todo dia por 30 dias", "Dica do dia: economia #1", "Comparação: dia 3 do desafio", "Participantes do desafio", "Oferta do desafio", "Como está seu desafio?", "Resumo da 1ª semana do desafio"
  ]},
  { week: 28, month: 8, focus: "Dia dos Pais", themes: [
    "Churrasco dos sonhos por < R$100", "Presentes criativos e baratos", "Comparação: itens de churrasco", "Homenagem aos pais economizadores", "Ofertas para o Dia dos Pais", "Melhor presente pro pai?", "Lista do churrasco perfeito"
  ]},
  { week: 29, month: 8, focus: "Volta às Aulas", themes: [
    "Material escolar: guia de economia", "Lanches escolares baratos", "Comparação: material escolar por loja", "Dicas de mães/pais", "Ofertas de material", "Maior gasto escolar?", "Checklist volta às aulas"
  ]},
  { week: 30, month: 8, focus: "Collab com Especialista", themes: [
    "Nutricionista: comer bem e barato", "Dica profissional de alimentação", "Comparação: alimentos saudáveis", "Entrevista com nutricionista", "Ofertas saudáveis", "Dúvida para o especialista?", "Cardápio saudável e econômico"
  ]},
  { week: 31, month: 8, focus: "Análise Anual de Preços", themes: [
    "10 produtos que mais subiram no ano", "Por que os preços sobem?", "Comparação: preços jan vs ago", "Inflação explicada de forma simples", "Ofertas que compensam", "Qual produto subiu mais?", "Estratégias anti-inflação"
  ]},
  { week: 32, month: 9, focus: "Compras Coletivas", themes: [
    "Economia compartilhada: compras em grupo", "Como organizar compra coletiva", "Comparação: atacado vs varejo", "Comunidades de compra", "Ofertas em quantidade", "Já fez compra coletiva?", "Guia de compras em grupo"
  ]},
  { week: 33, month: 9, focus: "Semana do Brasil", themes: [
    "Promoções nacionais: o que vale?", "Como filtrar ofertas reais", "Comparação especial: Semana do Brasil", "Verdade sobre descontos", "Melhores ofertas da semana", "Achou boa oferta?", "Balanço da Semana do Brasil"
  ]},
  { week: 34, month: 9, focus: "Primavera", themes: [
    "Frutas e verduras da estação", "Economia com sazonalidade", "Comparação: hortifruti de primavera", "Alimentos da estação são mais baratos", "Ofertas de hortifruti", "Fruta favorita?", "Lista de compras de primavera"
  ]},
  { week: 35, month: 9, focus: "Zero Desperdício", themes: [
    "Desafio: 1 semana sem desperdiçar", "Dicas anti-desperdício", "Comparação: quanto desperdiçamos em dinheiro?", "Receitas com sobras", "Ofertas conscientes", "Maior vilão do desperdício?", "Resumo do desafio"
  ]},
  { week: 36, month: 9, focus: "Retrospectiva Q3", themes: [
    "Trimestre 3: números da comunidade", "Lições dos últimos 3 meses", "Comparação: evolução de preços Q3", "Marcos alcançados", "Top ofertas do trimestre", "Nota para o trimestre?", "Metas Q4: Black Friday e Natal"
  ]},
  // Months 10-12
  { week: 37, month: 10, focus: "Dia das Crianças", themes: [
    "Brinquedos e guloseimas econômicas", "Presentes criativos sem gastar muito", "Comparação: preços de brinquedos", "Lembranças de infância", "Ofertas infantis", "Melhor presente?", "Atividades gratuitas com crianças"
  ]},
  { week: 38, month: 10, focus: "Preparação Black Friday", themes: [
    "Como não cair em pegadinhas na BF", "Comece a monitorar preços AGORA", "Comparação: preço normal vs 'promoção'", "Ferramentas para acompanhar preços", "Ofertas pré-BF", "O que quer na BF?", "Lista de desejos com preço atual"
  ]},
  { week: 39, month: 10, focus: "Preço Justo", themes: [
    "Como identificar promoção real", "Truques de precificação", "Comparação: promoção real vs falsa", "Direitos na promoção", "Ofertas verificadas", "Já caiu em promoção falsa?", "Guia anti-pegadinha"
  ]},
  { week: 40, month: 10, focus: "Planejamento Fim de Ano", themes: [
    "Economia de fim de ano começa agora", "Dica: reserve para Natal e Réveillon", "Comparação: preços pré vs pós Black Friday", "Planejamento financeiro Q4", "Primeiras ofertas", "Maior gasto de fim de ano?", "Planilha de planejamento"
  ]},
  { week: 41, month: 11, focus: "Esquenta Black Friday", themes: [
    "Esquenta BF: acompanhe preços ANTES", "Histórico de preços: ferramenta essencial", "Comparação: preços de outubro vs novembro", "Como nos preparamos", "Pré-ofertas", "Produto mais esperado?", "Countdown para a BF"
  ]},
  { week: 42, month: 11, focus: "Black Week", themes: [
    "Black Week: comparações diárias", "Oferta do dia #1", "Comparação intensiva: eletrônicos", "Bastidores: equipe em ação", "Oferta do dia #2", "Melhor oferta até agora?", "Resumo da Black Week"
  ]},
  { week: 43, month: 11, focus: "BLACK FRIDAY! 🔥", themes: [
    "5 dicas anti-engano na BF", "Acompanhe: antes vs durante BF", "Aquecimento: primeiras ofertas reais", "Véspera BF: checklist final", "BLACK FRIDAY: ofertas ao longo do dia!", "Balanço: melhores ofertas da BF", "Pós-BF: Cyber Monday"
  ]},
  { week: 44, month: 11, focus: "Pós-Black Friday", themes: [
    "O que sobrou de bom pós-BF", "Análise: BF valeu a pena?", "Comparação: economia real da BF", "Dados da BF na comunidade", "Ofertas remanescentes", "Quanto economizou na BF?", "Lições da Black Friday"
  ]},
  { week: 45, month: 12, focus: "Ceia de Natal", themes: [
    "Ceia econômica: comparação completa", "Receita de ceia barata", "Comparação: itens de ceia em 5 mercados", "Tradições natalinas econômicas", "Ofertas de Natal", "Prato favorito da ceia?", "Lista completa da ceia"
  ]},
  { week: 46, month: 12, focus: "Presentes de Natal", themes: [
    "Presentes sem gastar muito", "Amigo secreto econômico", "Comparação: presentes populares", "Ideias criativas", "Ofertas de presentes", "Faixa de preço do amigo secreto?", "Guia de presentes por orçamento"
  ]},
  { week: 47, month: 12, focus: "Natal", themes: [
    "Receitas natalinas pelo menor preço", "Dica: compre ingredientes com antecedência", "Comparação: panetone marca vs caseiro", "Feliz Natal da comunidade!", "Últimas ofertas do ano", "Tradição natalina favorita?", "Sobras de Natal: receitas"
  ]},
  { week: 48, month: 12, focus: "Retrospectiva do Ano", themes: [
    "Economia total da comunidade no ano", "Top 10 momentos do ano", "Comparação: preços jan vs dez", "Agradecimento especial", "Ofertas de fim de ano", "Momento favorito?", "Metas para o ano novo"
  ]},
  { week: 49, month: 12, focus: "Réveillon", themes: [
    "Réveillon econômico: bebidas e comidas", "Dica: festas bonitas sem gastar muito", "Comparação: espumantes e bebidas", "Contagem regressiva!", "Últimas ofertas", "Planos para o Réveillon?", "Lista de compras do Réveillon"
  ]},
  { week: 50, month: 12, focus: "Melhores Momentos", themes: [
    "Top 10 melhores momentos da comunidade", "Dica mais salva do ano", "Comparação mais impactante do ano", "Os bastidores do ano", "Ofertas que marcaram", "Sua maior economia?", "Comunidade em números"
  ]},
  { week: 51, month: 12, focus: "Planejamento Novo Ano", themes: [
    "Planejamento financeiro para o ano novo", "Metas de economia para o próximo ano", "Comparação: primeiro mês é o mais caro?", "Nossos planos para o próximo ano", "Ofertas de janeiro chegando", "Sua meta de economia?", "Template de planejamento"
  ]},
  { week: 52, month: 12, focus: "Encerramento", themes: [
    "Feliz Ano Novo! Surpresas vindo aí", "Última dica do ano", "Comparação final do ano", "Obrigado por tudo!", "Primeira oferta do ano novo", "Resolução de ano novo?", "Nos vemos no próximo ano! 🎉"
  ]},
];

export const marketingCalendar: MarketingWeek[] = weeklyContent.map((w) => ({
  week: w.week,
  month: w.month,
  focus: w.focus,
  days: w.themes.map((theme, i) => ({
    week: w.week,
    dayOfWeek: dayThemes[i].dayOfWeek,
    format: dayThemes[i].format,
    formatEmoji: dayThemes[i].formatEmoji,
    pillar: dayThemes[i].pillar,
    theme,
  })),
}));

export const getWeekForDate = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.min(Math.ceil(diff / oneWeek), 52);
};

export const getDayIndex = (date: Date): number => {
  const day = date.getDay();
  // Sunday = 0 in JS, but our calendar has Sunday = 6
  return day === 0 ? 6 : day - 1;
};

export const getTodayContent = (): { week: MarketingWeek; day: MarketingDay } | null => {
  const today = new Date();
  const weekNum = getWeekForDate(today);
  const dayIdx = getDayIndex(today);
  const week = marketingCalendar.find((w) => w.week === weekNum);
  if (!week) return null;
  return { week, day: week.days[dayIdx] };
};
