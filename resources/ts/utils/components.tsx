import { Suspense } from 'react';
import { Card } from 'antd';
import { ErrorBoundary } from '@/components/ErrorBoundary'; // , lazyWithRetries

export const lazyComponent = (Element: any, loading?: any) => {
  // const [RetryElement, setRetryElement] = useState<any>(null);

  return (
    <ErrorBoundary
      // onError={(err) => {
      //   if(navigator.onLine){
      //     const src = err.message.split(' ').pop() as string;
      //     console.log('src: ', src);

      //     // const retry = await import(/* @vite-ignore */ src + '?t=' + +new Date());
      //     setRetryElement( lazy(() => import(/* @vite-ignore */ src + '?t=' + +new Date())) ); // () => retry | retry.default()
      //     // console.log('retry: ', retry);
      //   }
      // }}
    >
      <Suspense fallback={loading || <Card loading className="shadow" />}>
        <Element />
        {/* {RetryElement ? <RetryElement /> : <Element />} */}
      </Suspense>
    </ErrorBoundary>
  )
}
