import { useIsAuthenticated } from "@refinedev/core";
import { Layout as AntLayout } from 'antd';
// import { Header } from './Header';
import { Nav } from './Nav';

export const Layout = ({
  // head,
  children,
}: any) => {
  const { isLoading, data } = useIsAuthenticated();

  return (
    <AntLayout className="min-h-fullscreen">
      <AntLayout>
        {/* {head ?? <Nav loading={isLoading} user={data} />} */}

        <Nav loading={isLoading} user={data} />

        <AntLayout.Content>
          {children}
        </AntLayout.Content>
      </AntLayout>
    </AntLayout>
  );
}

/*
<AntLayout className="min-h-fullscreen p-2">
  <AntLayout className="p-2 border-4 border-sky-2 rounded-lg">
    <Header El={AntLayout.Header} />

    <AntLayout.Content className="flex flex-col">
      {children}
    </AntLayout.Content>
  </AntLayout>
</AntLayout>
*/
