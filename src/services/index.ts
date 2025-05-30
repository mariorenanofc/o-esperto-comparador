
export { comparisonService } from './comparisonService';
export { reportsService } from './reportsService';
export { storeService } from './storeService';
export { productService } from './productService';

// Serviço centralizado para operações de banco de dados
export const databaseService = {
  // Quando conectar com Prisma, este será o ponto central de configuração
  isConnected: false,
  
  async initialize() {
    // TODO: Inicializar conexão com Prisma
    console.log('Database service initialized');
    this.isConnected = true;
  },
  
  async disconnect() {
    // TODO: Fechar conexão com Prisma
    console.log('Database service disconnected');
    this.isConnected = false;
  }
};
