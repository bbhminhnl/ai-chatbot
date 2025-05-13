import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 768) {
  /**
   * Tạo state isMobile
   */
  const [is_mobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return is_mobile;
}
