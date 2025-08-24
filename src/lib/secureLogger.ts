import { maskSensitiveData, isDevelopment } from './security';

export const secureLogger = {
  log: (message: string, data?: any) => {
    if (isDevelopment()) {
      if (data) {
        console.log(message, maskSensitiveData(data));
      } else {
        console.log(message);
      }
    }
  },

  error: (message: string, error?: any) => {
    if (isDevelopment()) {
      if (error) {
        console.error(message, maskSensitiveData(error));
      } else {
        console.error(message);
      }
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment()) {
      if (data) {
        console.warn(message, maskSensitiveData(data));
      } else {
        console.warn(message);
      }
    }
  }
};