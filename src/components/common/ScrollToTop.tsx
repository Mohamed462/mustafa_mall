import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every navigation to a new route immediately scrolls the window to the top (0, 0),
 * resolving the SPA scroll persistence bug where pages opened at the previous scroll offset.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Instant jump to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, search]);

  return null;
};
