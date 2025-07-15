// "use client";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"; // useErrorBoundary, 
import type { ReactNode, ErrorInfo } from 'react';
import { Result, Button } from 'antd';
import { useNavigation } from "@refinedev/core";

interface ErrorBoundaryProps {
  children?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundary({
  children,
  onError,
}: ErrorBoundaryProps){
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      // onReset={(details) => {
      //   // Reset the state of your app so the error doesn't happen again
      //   console.log('onReset details: ', details)
      // }}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  )
}

function Fallback({ resetErrorBoundary }: any){ // error,
  const { push } = useNavigation();
  const rootRoute = ['/', '/home'];

  const backTo = () => { // e: any    
    push("/");

    // props?.onClick?.(e);
  }

  return (
    <Result
      status="warning"
      title="Something went wrong"
      subTitle={!navigator.onLine && "No internet connection"}
      extra={
        <>
          <Button onClick={resetErrorBoundary}>Try again</Button>
          {' '}
          {!rootRoute.includes(window.location.pathname) && (
            <Button
              ghost
              type="primary"
              onClick={backTo}
            >
              Back to Home
            </Button>
          )}
        </>
      }
    />
  );
}
