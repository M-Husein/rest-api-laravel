import { useEffect } from 'react';

export const SplashScreen: React.FC = () => {
  useEffect(() => {
    const loader = document.getElementById('loaderApp');
    // Show loading
    loader?.classList.remove('hidden');
    
    return () => { // Hide loading
      loader?.classList.add('hidden');
    }
  }, []);

  return null;
}
