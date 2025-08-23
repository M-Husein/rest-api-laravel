import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import type { ReactNode, ErrorInfo } from 'react';
import { Result, Button } from 'antd';
import { useNavigation, useTranslate, useGetIdentity } from "@refinedev/core";
import { api } from '@/providers/dataProvider';

interface ErrorBoundaryProps {
  children?: ReactNode;
  // onError?: (error: Error, info: ErrorInfo) => void;
}

const replaceMultiSpace = (str: string | null | undefined) => str?.replace(/ {4,}/gm, " ");

export const ErrorBoundary = ({
  children,
  // onError,
}: ErrorBoundaryProps) => {
  const { data: currentUser } = useGetIdentity<any>();

  const reportErrors = (error: Error, info: ErrorInfo) => {
    // if(process.env.NODE_ENV === 'production'){

    // }

    let meta: any = {
      framework: "React",
      url: window.location.href,
    };

    if(currentUser){
      meta.userId = currentUser.id;
    }

    if(info.componentStack){
      meta.componentStack = replaceMultiSpace(info.componentStack);
    }

    api.post("errors", {
      // credentials: "omit",
      keepalive: true,
      json: {
        name: error.name || "Unknown",
        message: error.message,
        stack: replaceMultiSpace(error.stack),
        meta,
      }
    });
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      // onReset={(details) => { // details
      //   // Reset the state of your app so the error doesn't happen again
      //   console.log('onReset details: ', details);
      //   // Reset state or retry API
      //   // window.location.reload();
      //   // Or if using context/state mgmt: reset to a clean state
      // }}
      // onError={onError}
      onError={reportErrors}
    >
      {children}
    </ReactErrorBoundary>
  );
}

const rootRoute = ['/', '/app']; // /home

const Fallback = ({ resetErrorBoundary }: any) => { // error
  const translate = useTranslate();
  const { push } = useNavigation();

  // const backTo = () => { // e: any    
  //   push("/");
  //   // props?.onClick?.(e);
  // }

  // console.log('onError error: ', error);
  /**
   * TypeError
   * ReferenceError
   * RangeError
   * SyntaxError
   */
  //  !['ReferenceError', 'SyntaxError].includes(error.name)

  return (
    <Result
      status="warning"
      title={translate('error.unspecific')} // "Something went wrong"
      subTitle={!navigator.onLine && translate('error.noInternet')} // "No internet connection"
      extra={
        <>
          {!!resetErrorBoundary && <Button onClick={resetErrorBoundary}>{translate('tryAgain')}</Button>}
          {' '}
          {!rootRoute.includes(window.location.pathname) && (
            <Button
              ghost
              type="primary"
              onClick={() => push("/")} // backTo
            >
              Back to Home
            </Button>
          )}
        </>
      }
    />
  );
}
