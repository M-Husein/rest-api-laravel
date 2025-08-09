import type { PropsWithChildren } from "react";
import { createContext, useContext, useState, useEffect, useMemo } from 'react'; // , useDebugValue
import { useGetLocale } from "@refinedev/core";
import { ConfigProvider, App as AntdApp, theme as AntdTheme } from "antd";
import { setDayjsLocale } from '@/utils/locale/setDayjsLocale';
import { getAntdLocale } from '@/utils/locale/getAntdLocale';
// import { zodConfig } from '@/utils/locale/validation';
import { toggleLoaderApp } from '@/utils/dom';

// zodConfig();

/** @OPTION : For toggle color scheme */
const toggleTheme = (theme: string) => {
  let html = document.documentElement;

  html.classList.remove(
    (theme === 'dark' ? 'light' : 'dark'),
    'system'
  );

  html.classList.add(theme);
  
  let metaTheme = html.querySelector('meta[name=theme-color]') as any;
  if(metaTheme){
    metaTheme.content = getComputedStyle(html).getPropertyValue('--q-bg-nav'); // --q-bg-main
  }
}

type AppThemeType = {
  theme: string;
  setTheme: (theme: string) => void;
};

type AppContextType = {
  user: any;
  setUser: (data: any) => void;
};

const AppThemeContext = createContext<AppThemeType>({} as AppThemeType);

export const useAppTheme = () => {
  // const { auth } = useContext(AppContext);
  // useDebugValue(auth, auth => auth?.user ? "Logged In" : "Logged Out")
  return useContext(AppThemeContext);
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => {
  return useContext(AppContext);
}

// AppLocale
export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [antdLocale, setAntdState] = useState<any>();

  const locale = useGetLocale();
  const currentLocale = locale();

  const tokenKey = import.meta.env.VITE_TOKEN_KEY;
  const userData = sessionStorage.getItem(tokenKey);
  const [user, setUser] = useState(userData ? JSON.parse(userData) : null);

  const setupUser = (data: any) => {
    setUser(data);
    data && sessionStorage.setItem(tokenKey, JSON.stringify(data));
  }

  const value = useMemo(() => ({ user, setUser: setupUser }), [user]);

  useEffect(() => {
    (async () => {
      toggleLoaderApp();
      try {
        let fixLocale = currentLocale || document.documentElement.lang || localStorage.getItem("i18nextLng") || APP.defaultLang;

        await setDayjsLocale(fixLocale);

        const loadedAntdLocale = await getAntdLocale(fixLocale);
        setAntdState(loadedAntdLocale || undefined);

        localStorage.setItem("i18nextLng", fixLocale);

      } catch (error) {
        console.error("Error loading locales:", error);
      } 
      finally {
        setTimeout(toggleLoaderApp, 250);
      }
    })()
  }, [currentLocale]);

  return (
    <ConfigProvider
      locale={antdLocale}
      // componentDisabled={isLoading}
    >
      <AppContext.Provider
        value={value}
      >
        {children}
      </AppContext.Provider>
    </ConfigProvider>
  );
}

export const AppTheme: React.FC<PropsWithChildren> = ({
  children,
}) => {
  // const isSystemPreferenceDark = window?.matchMedia("(prefers-color-scheme: dark)").matches;
  const initTheme = JSON.parse(sessionStorage.getItem(import.meta.env.VITE_TOKEN_KEY) as any)?.theme || localStorage.getItem("theme");
  // const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [theme, setTheme] = useState(initTheme || "light"); //  || systemPreference

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("theme", theme);
    toggleTheme(theme); // theme === "dark"
  }, [theme]);

  const setColorMode = () => {
    setTheme(isDark ? "light" : "dark");
  }

  const value = useMemo(() => ({ theme, setTheme: setColorMode }), [theme]);

  return (
    <AppThemeContext.Provider
      // value={{ theme, setTheme: setColorMode }}
      value={value}
    >
      <ConfigProvider 
        wave={{
          disabled: true,
        }}
        prefixCls="a" // Default = "ant" (NOTE: Change in scss / css files too)
        iconPrefixCls="ai" // Default = "anticon" (NOTE: Change in scss / css files too)
        // componentDisabled={true} // For disabled components: Button, Input, Checkbox, Dropdown Button, 
        theme={{
          /** @OPTION : Using color scheme light / dark */
          // ...RefineThemes.Blue,
          // algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          algorithm: isDark ? AntdTheme.darkAlgorithm : AntdTheme.defaultAlgorithm,
          token: {
            // motion: false,
            // fontFamily: "'Lato',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
            // fontSize: 14,
            // lineHeight: 1.6, // default: 1.5714285714285714,
            // colorText: "",
            // colorLink: "#ff7a00",
            // colorPrimary: "#fbdd0b",
            // colorTextLightSolid: "#555",
            // colorTextBase: "#fff",
            // colorBgElevated: "#16085f",
            // colorBgLayout: "#f4f4f4", // #f5f5f5
            
            /** @DEV : ??? */
            // @ts-ignore
            zIndexPopupBase: 1055, // For Modal
            // borderRadius: 8, // 6
            // borderRadiusLG: 10, // 8
            // borderRadiusSM: 6, // 4
          },
          components: {
            // Button: {
            //   fontWeight: 600, // 500
            //   primaryColor: "#333",
            // },
            // Input: {
            //   activeShadow: "none",
            //   errorActiveShadow: "none",
            // },
            Menu: {
              algorithm: true, // Enable algorithm
              itemPaddingInline: 9, // Default: 16
              // itemSelectedColor: "#fb7800",
            },
            // Dropdown: {
            //   // zIndexPopup: 999,
            //   itemSelectedColor: "#fb7800", // NOT WORK
            // },
            // Select: {
            //   zIndexPopup: 999,
            // },
            Notification: {
              zIndexPopup: 2056, // 1060
            },
            // DatePicker: {
            //   zIndexPopup: 999,
            // },
            Table: {
              cellPaddingBlockSM: 5,
              // cellFontSizeSM: 13,
            },
          },
        }}
      >
        <AntdApp
          notification={{ bottom: 0 }}
        >
          {children}
        </AntdApp>
      </ConfigProvider>
    </AppThemeContext.Provider>
  );
}
