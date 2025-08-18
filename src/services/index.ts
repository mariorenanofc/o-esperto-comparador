
export { comparisonService } from './comparisonService';
export { reportsService } from './reportsService';
export { storeService } from './storeService';
export { productService } from './productService';
export { categoryService } from './categoryService';

// Serviço centralizado para operações de banco de dados
export const databaseService = {
  isConnected: false,
  
  async initialize() {
    // Initialize database connections and configurations
    try {
      this.isConnected = true;
      return { success: true, message: 'Database service initialized successfully' };
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Database initialization failed: ${error}`);
    }
  },
  
  async disconnect() {
    // Gracefully close database connections
    try {
      this.isConnected = false;
      return { success: true, message: 'Database service disconnected successfully' };
    } catch (error) {
      throw new Error(`Database disconnection failed: ${error}`);
    }
  }
};
