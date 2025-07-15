import { useEffect, useRef } from 'react'; // , useCallback

export const useAbortSignal = () => {
  const controllerRef: any = useRef();

  // const set = useCallback((callback?: any) => {
  //   controllerRef.current = new AbortController();
  //   callback?.();
  // }, []);

  const set = (callback?: any) => {
    controllerRef.current = new AbortController();
    callback?.(controllerRef.current);
  }

  const reset = () => {
    controllerRef.current = null;
  }

  const abort = () => {
    if(controllerRef.current){
      controllerRef.current.abort();
      reset();
    }
  }

  useEffect(() => {
    return () => {
      if(controllerRef.current){
        controllerRef.current.abort()
      }
    }
  }, []);

  return {
    set,
    reset,
    abort,
    // controller: controllerRef.current,
  }
}
