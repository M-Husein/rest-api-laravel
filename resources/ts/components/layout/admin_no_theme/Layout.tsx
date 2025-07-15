// import type { IUser } from '@/types/Types';
// import { HttpError, useOne } from "@refinedev/core"; // useGetIdentity, useNavigation
// import Cookies from 'js-cookie';
import { Layout as AntdLayout, FloatButton } from 'antd'; // , Card
import { ArrowUpOutlined } from '@ant-design/icons';
import { Title } from './Title';
import { Header } from './Header';
import { Sider } from './Sider';
import { ThemedLayoutContextProvider } from "@/contexts/themedLayout";
import '@/style/components/layout_main.scss';

const appName = import.meta.env.VITE_APP_NAME;

export const Layout: React.FC<any> = ({
  children,
  // initialSiderCollapsed,
  Footer,
  OffLayoutArea,
}) => {
  // @ts-ignore
  const asideMin: any = !!+localStorage.getItem('asideMin');

  // const { data: user } = useGetIdentity<IUser>();
  // const { push } = useNavigation();

  // @ts-ignore // refreshToken
  // const {
  //   isLoading,
  //   isFetching,
  //   isRefetching
  // } = useOne<any, HttpError>({
  //   resource: "authentication", // /api/authentication/refresh-token
  //   id: "refresh-token",
  //   meta: { method: "post" },
  //   queryOptions: { keepPreviousData: false },
  //   successNotification: (res: any) => {
  //     if(res?.success){
  //       Cookies.set(
  //         TOKEN_KEY, 
  //         res.data.token,
  //         {
  //           ameSite: 'strict',
  //           expires: +import.meta.env.VITE_TOKEN_EXP,
  //           secure: window.location.protocol === "https:" // isSecureContext
  //         }
  //       );
  //     }
  //     return false
  //   }
  // });

  return (
    <ThemedLayoutContextProvider
      initialSiderCollapsed={asideMin} // initialSiderCollapsed
    >
      <AntdLayout className="min-h-fullscreen">
        <Sider
          theme="light"
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

            {OffLayoutArea && <OffLayoutArea />}
          </AntdLayout.Content>

          {/* {!(isLoading || isFetching || isRefetching) ? 
            <AntdLayout.Content className="lg_p-5 p-2 relative">
              {children}

              {OffLayoutArea && <OffLayoutArea />}
            </AntdLayout.Content>
            :
            <Card loading className="m-4 shadow" />
          } */}

          {Footer && <Footer />}

          <FloatButton.BackTop
            type="primary"
            visibilityHeight={99}
            icon={<ArrowUpOutlined />} // @ts-ignore
            tabIndex={-1}
            style={{ marginBottom: -40, marginRight: -16 }}
            title="Back to top"
          />
        </AntdLayout>
      </AntdLayout>
    </ThemedLayoutContextProvider>
  )
}
