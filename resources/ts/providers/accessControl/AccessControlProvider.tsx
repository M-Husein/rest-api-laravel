import { PropsWithChildren, createContext, useEffect, useState, useContext } from "react"; // , useMemo, useDebugValue
// import { HttpError, useList } from "@refinedev/core"; // useGetIdentity, useTranslate, useParsed, useNavigation
import { useLocation } from "react-router-dom";
import { getToken } from '@/utils/authToken'; // , clearToken
import { httpRequest } from "@/providers/dataProvider/utils/httpRequest";
import { RESOURCES } from "@/routes/resources";

type AccessControlProviderType = {
  resouces: any,
  accessControl: any;
  setAccessControl: (data: any) => void;
};

export const AccessControlContext = createContext<AccessControlProviderType>({} as AccessControlProviderType);

const findAccess = (val: any, item: any) => val.entity_name === item.entity_name; // val.can_access <= 0 && 

// For check request access menu api
let hasRequestAccessMenu: any = null;

export const useAccessControl = () => {
  // const { auth } = useContext(AppContext);
  // useDebugValue(auth, auth => auth?.user ? "Logged In" : "Logged Out")
  return useContext(AccessControlContext);
}

export function AccessControlProvider({
  children,
}: PropsWithChildren){
  const location = useLocation();
  const [loadingAccessControl, setLoadingAccessControl] = useState<any>(false);
  const [resouces, setResouces] = useState<any>(RESOURCES);

  const accessControlProcess = () => {
    let isAuthPage = ["/login", "/forgot-password"].includes(location.pathname);

    if(hasRequestAccessMenu && isAuthPage){
      hasRequestAccessMenu = null;
      setLoadingAccessControl(true);
      return;
    }
    if(hasRequestAccessMenu){
      return;
    }

    let token = getToken();
    // let user = sessionStorage.getItem(import.meta.env.VITE_TOKEN_KEY);

    // console.log('token: ', token)
    // console.log('user: ', user)

    if(!isAuthPage && token){ //  && user
      setLoadingAccessControl(true);

      (async () => {
        try {
          const req: any = await httpRequest.get(
            "application-user/access-menu", // ?UserId= + JSON.parse(user).id
            { 
              headers: {
                Authorization: 'Bearer ' + token,
              },
            }
          )
          .json();
  
          // console.log('req: ', req)
  
          if(req?.success){
            let accessMenus = req.data;
            hasRequestAccessMenu = accessMenus;
  
            let fixResources: any = RESOURCES.map((item: any) => {
              let menu = accessMenus.find((val: any) => findAccess(val, item));
              // console.log('menu: ', menu);
  
              if(menu){
                const fixMenu = { ...menu, ...item };
                return menu.can_access <= 0 ? {
                  ...fixMenu,
                  meta: {
                    ...fixMenu.meta,
                    hide: true,
                  }
                }
                :
                fixMenu
              }
              return item;
            });
  
            // console.log('fixResources: ', fixResources);
            setResouces(fixResources);
          }
        } catch(e){
          // 
        } finally {
          setLoadingAccessControl(false);
        }
      })()
    }
  }

  useEffect(() => {
    accessControlProcess()
  }, [location]);

  // const value = useMemo(() => ({
  //   resouces,
  //   accessControl: {
  //     can: async ({ action, params }: any) => { // resource, 
  //       // console.log('resource: ', resource);
  
  //       if(action === "list"){ // @ts-ignore
  //         let menu = resouces.find((val: any) => findAccess(val, params?.resource || {}));
  //         // console.log('menu: ', menu);
  //         if(menu && menu.can_access <= 0){
  //           return { can: false }; // , reason: "Unauthorized"
  //         }
  //         return { can: true };
  //       }
  //       return { can: true };
  //     },
  //   }, 
  //   setAccessControl: setResouces
  // }), [resouces]);

  // const value: any = {
  //   resouces,
  //   accessControl: {
  //     can: async ({ action, params }: any) => { // resource, 
  //       // console.log('resource: ', resource);
  
  //       if(action === "list"){ // @ts-ignore
  //         let menu = resouces.find((val: any) => findAccess(val, params?.resource || {}));
  //         // console.log('menu: ', menu);
  //         if(menu && menu.can_access <= 0){
  //           return { can: false }; // , reason: "Unauthorized"
  //         }
  //         return { can: true };
  //       }
  //       return { can: true };
  //     },
  //   }, 
  //   setAccessControl: setResouces
  // };

  return (
    <AccessControlContext.Provider
      value={{
        resouces,
        accessControl: {
          can: async ({ action, params }: any) => { // resource, 
            // console.log('resource: ', resource);
      
            if(action === "list"){ // @ts-ignore
              let menu = resouces.find((val: any) => findAccess(val, params?.resource || {}));
              // console.log('menu: ', menu);
              if(menu && menu.can_access <= 0){
                return { can: false }; // , reason: "Unauthorized"
              }
              return { can: true };
            }
            return { can: true };
          },
        }, 
        setAccessControl: setResouces
      }}
    >
      <div className={loadingAccessControl ? "loadingAccessControl" : ""}>
        {children}
      </div>
    </AccessControlContext.Provider>
  )
}
