import '@/style/components/layout_main.scss';

// import { useMemo } from "react";
// import { ThemedLayoutV2 } from "@refinedev/antd"; // useTranslate, ThemedTitleV2, ThemedSiderV2
// import { HttpError, useList } from "@refinedev/core"; // useGetIdentity, useOne, useUpdate
// import Cookies from 'js-cookie';
import { Layout as AntdLayout, FloatButton } from 'antd';
// import { FaChevronUp } from "react-icons/fa6";
import { ArrowUpOutlined } from '@ant-design/icons';
import { Title } from './Title';
import { Header } from './Header';
import { Sider } from './Sider';
import { useAppTheme } from "@/contexts/app/Context";
import { ThemedLayoutContextProvider } from "@/contexts/themedLayout";

export const Layout: React.FC<any> = ({
  appName,
  children,
  // initialSiderCollapsed,
  // Footer,
  // OffLayoutArea,
}) => {
  // @ts-ignore
  const initSiderCollapsed: any = !!+localStorage.getItem('asideMin');

  const { theme } = useAppTheme();
  // const { data: user } = useGetIdentity<IUser>();
  // const isSysAdmin = user?.is_sysadmin; //  && user?.name === 'system'

  // @ts-ignore
  // const refreshToken = useList<any, HttpError>({
  //   queryOptions: {
  //     retry: false,
  //     keepPreviousData: false,
  //     // enabled: ,
  //   },
  //   resource: "auth/refresh-token",
  //   meta: { method: "post" },
  //   successNotification: ({ data }: any) => {
  //     if(data?.success){
  //       Cookies.set(
  //         import.meta.env.VITE_TOKEN_KEY, 
  //         data.data + import.meta.env.VITE_TOKEN_EXP + import.meta.env.VITE_APP_Q,
  //         {
  //           expires: +import.meta.env.VITE_TOKEN_EXP,
  //           secure: true,
  //           sameSite: 'strict'
  //         }
  //       );
  //     }
  //     return false
  //   }
  // });

  return (
    <ThemedLayoutContextProvider
      initialSiderCollapsed={initSiderCollapsed} // initialSiderCollapsed
    >
      <AntdLayout className="min-h-fullscreen" data-nosnippet={true}>
        <Sider
          appName={appName}
          theme={theme}
          Title={({ collapsed }: any) => (
            <Title
              collapsed={collapsed}
              text={appName}
              icon={<img width={24} height={24} src="/logo-36x36.png" alt={appName} />}
            />
          )}
        />

        <AntdLayout>
          <Header />

          <AntdLayout.Content className="lg_p-5 p-2 relative">
            {children}

            {/* {OffLayoutArea && <OffLayoutArea />} */}
          </AntdLayout.Content>

          {/* {Footer && <Footer />} */}
          <footer className="py-3 px-4 text-xs text-gray-400">
            @ 2024, Made with ❤️ <strong>{appName}</strong>
          </footer>

          <FloatButton.BackTop
            type="primary"
            visibilityHeight={99}
            // <FaChevronUp />
            icon={<ArrowUpOutlined />} // @ts-ignore
            tabIndex={-1}
            style={{ marginBottom: -40, marginRight: -16 }}
            title="Back to top" // tooltip
          />
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  )
}
