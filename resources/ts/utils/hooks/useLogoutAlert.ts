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
            onClick: () => window.location.replace('/auth/login'),
          },
        });
      }
    }

    const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);

    bc.addEventListener('message', onMessage);

    return () => {
      bc.removeEventListener('message', onMessage);
    }
  }, []);

  // return modalContextHolder;
}
