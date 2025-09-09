import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Track page view for new pages
    if (currentPath !== previousPathRef.current) {
      analytics.trackPageView(currentPath, {
        search: location.search,
        hash: location.hash,
        referrer: previousPathRef.current || document.referrer
      });
      previousPathRef.current = currentPath;
    }

    // Track time on page when leaving
    return () => {
      const timeOnPage = Date.now() - startTime;
      analytics.track({
        event_type: 'engagement',
        event_name: 'time_on_page',
        properties: {
          page: currentPath,
          time_spent_ms: timeOnPage,
          time_spent_seconds: Math.round(timeOnPage / 1000)
        }
      });
    };
  }, [location]);

  // Web Vitals tracking
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const trackWebVitals = async () => {
      try {
        const { onCLS, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        onCLS(analytics.trackWebVitals.bind(analytics));
        onFCP(analytics.trackWebVitals.bind(analytics));
        onLCP(analytics.trackWebVitals.bind(analytics));
        onTTFB(analytics.trackWebVitals.bind(analytics));
      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }
    };

    trackWebVitals();
  }, []);

  return {
    trackEvent: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackComparison: analytics.trackComparison.bind(analytics),
    trackContribution: analytics.trackContribution.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics)
  };
};