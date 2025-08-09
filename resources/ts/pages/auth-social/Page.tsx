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

  useDocumentTitle(`Social Auth ${provider} - ${APP.name}`);

  useEffect(() => {
    // Define the channel name. It MUST be the same as in the main window.
    const loginChannel = new BroadcastChannel('social_auth_channel');
    const source = 'SOCIAL_AUTH_BC'; // Custom identifier for your message

    const doClose = () => {
      loginChannel.close();
      // Small delay to ensure message has time to propagate
      setTimeout(() => window.close(), 500);
    }

    if(token && user){
      try {
        loginChannel.postMessage({
          ok: true,
          source,
          provider,
          user: JSON.parse(user),
          token: token,
          expiresAt: exp
        });

        doClose();
      }catch(e: any){
        loginChannel.postMessage({
          ok: false,
          source,
          error: 'parse_error',
          message: 'Failed to process user data from social login.',
          details: e.message
        });
        
        doClose();
      }
    }
    else if(error){
      loginChannel.postMessage({
        ok: false,
        source,
        error: error || 'unknown_error',
        message: message || 'Social login failed.'
      });
      
      doClose();
    }
    else{
      doClose();
    }
  }, [token, user]);

  return null;
}
