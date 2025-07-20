import { useEffect } from 'react';
import { toggleLoaderApp } from '@/utils/dom';

export const SplashScreen: React.FC = () => {
  // useEffect(() => {
  //   const loader = document.getElementById('loaderApp');
  //   // Show loading
  //   loader?.classList.remove('hidden');
    
  //   return () => { // Hide loading
  //     loader?.classList.add('hidden');
  //   }
  // }, []);

  useEffect(() => {
    toggleLoaderApp(false);
    
    return () => { // Hide loading
      toggleLoaderApp(true);
    }
  }, []);

  return null;
}
