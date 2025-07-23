import { useEffect } from 'react';
// import { Modal } from 'antd';

export const useLogoutAlert = (modalApi: any, options?: any) => {
  // const [modalApi, modalContextHolder] = Modal.useModal();

  useEffect(() => {
    const onMessage = (e: any) => {
      if(e.data.type === "LOGOUT"){
        sessionStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
        
        modalApi.warning({
          centered: true,
          keyboard: false,
          title: options?.title || "Ups",
          content: options?.content || "You are logged out from another tab/window.",
          okText: "Login",
          okButtonProps: {
            onClick: () => {
              // '/auth/login'
              window.location.replace(import.meta.env.VITE_LOGIN_PATH)
            },
          },
        });
      }
    }

    const BC = new BroadcastChannel(import.meta.env.VITE_BC_NAME);

    BC.addEventListener('message', onMessage);

    return () => {
      BC.removeEventListener('message', onMessage);
    }
  }, []);

  // return modalContextHolder;
}
