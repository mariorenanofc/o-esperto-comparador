// Bundle optimization utilities
export const measureBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((size, script) => {
      const src = (script as HTMLScriptElement).src;
      return size + (src.length * 2); // Rough estimate
    }, 0);
    
    console.group('Bundle Analysis');
    console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`Script count: ${scripts.length}`);
    console.groupEnd();
  }
};

// Performance monitoring
export const measurePerformance = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  }
  return null;
};

// Tree shaking helper
export const dynamicImport = async <T>(importFn: () => Promise<{ default: T }>) => {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error('Dynamic import failed:', error);
    throw error;
  }
};