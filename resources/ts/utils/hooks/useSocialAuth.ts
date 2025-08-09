import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from '@/utils/authToken';
import i18n from "@/i18n";

export const useSocialAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Define the channel name. Make it unique to your app/purpose.
    const loginChannel = new BroadcastChannel('social_auth_channel');
    
    const handleBroadcastMessage = (e: any) => {
      const data = e.data;
      if(data.source === 'SOCIAL_AUTH_BC'){
        if (data.ok) {
          // console.log('Main Window: Social login successful:', data.user);
          setToken(data.token, data.expiresAt || 395);

          localStorage.setItem("i18nextLng", data.user.lang);
          document.documentElement.lang = data.user.lang;
          i18n.changeLanguage(data.user.lang);

          // window.location.replace('/');
          navigate('/', { replace: true });
        } else {
          // window.location.replace(`/auth/login?error=${data.error}&message=${data.message}`);
          navigate(
            `/auth/login?error=${data.error}&message=${data.message}`, 
            { replace: true }
          );
        }
      }
    };

    loginChannel.addEventListener('message', handleBroadcastMessage);
    // console.log("Main Window: BroadcastChannel listener added");

    return () => {
      loginChannel.removeEventListener('message', handleBroadcastMessage);
      loginChannel.close(); // Close the channel when component unmounts
      // console.log("Main Window: BroadcastChannel listener removed and closed");
    };
  }, []);
}
