import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useMobileDetection = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.screen.width;
      
      // Mobile detection
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
      // Tablet detection
      const tabletKeywords = ['tablet', 'ipad'];
      const isTabletUA = tabletKeywords.some(keyword => userAgent.includes(keyword));
      
      // Screen size based detection
      const isMobileScreen = screenWidth <= 768;
      const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
      
      const isMobile = (isMobileUA || isMobileScreen) && !isTabletUA;
      const isTablet = isTabletUA || (isTabletScreen && !isMobileUA);
      const isDesktop = !isMobile && !isTablet;
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    detectDevice();
    
    // Listen for screen size changes
    window.addEventListener('resize', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return detection;
};