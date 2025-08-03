import { useEffect } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";

export default function Page(){
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const user = urlParams.get('user');
  const provider = urlParams.get('provider') || window.location.pathname.split('/').at(-1);
  const error = urlParams.get('error');
  const message = urlParams.get('message');
  const exp = urlParams.get('exp');

  useDocumentTitle(`Social Auth ${provider} - ${import.meta.env.VITE_APP_NAME}`);

  useEffect(() => {
    // Define the channel name. It MUST be the same as in the main window.
    const LOGIN_CHANNEL_NAME = 'social_login_channel';
    const loginChannel = new BroadcastChannel(LOGIN_CHANNEL_NAME);
    const source = 'social-login-broadcast'; // Custom identifier for your message

    if (token && user) {
      try {
        loginChannel.postMessage({
          ok: true,
          source,
          provider,
          user: JSON.parse(user),
          token: token,
          expiresAt: exp
        });

        loginChannel.close();

        // Small delay to ensure message has time to propagate
        setTimeout(() => window.close(), 500);
      } catch (e: any) {
        loginChannel.postMessage({
          ok: false,
          source,
          error: 'parse_error',
          message: 'Failed to process user data from social login.',
          details: e.message
        });
        
        loginChannel.close();
        
        setTimeout(() => window.close(), 500);
      }
    }else if(error){
      loginChannel.postMessage({
        ok: false,
        source,
        error: error || 'unknown_error',
        message: message || 'Social login failed.'
      });
      
      loginChannel.close();

      setTimeout(() => window.close(), 500);
    }else{
      loginChannel.close();
      setTimeout(() => window.close(), 500);
    }
  }, [token, user]);

  return null;
}
