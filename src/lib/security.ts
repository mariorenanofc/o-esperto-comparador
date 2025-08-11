export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***';
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 3 
    ? username.substring(0, 3) + '***' 
    : '***';
  
  return `${maskedUsername}@${domain}`;
};

export const maskSensitiveData = (data: any): any => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Mask potential emails in strings
    return data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => maskEmail(match));
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  if (typeof data === 'object') {
    const maskedObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('email')) {
        maskedObj[key] = typeof value === 'string' ? maskEmail(value) : value;
      } else if (key.toLowerCase().includes('customer') || key.toLowerCase().includes('stripe')) {
        maskedObj[key] = '***PROTECTED***';
      } else {
        maskedObj[key] = maskSensitiveData(value);
      }
    }
    return maskedObj;
  }
  
  return data;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const secureLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    if (data) {
      console.log(message, maskSensitiveData(data));
    } else {
      console.log(message);
    }
  }
};