import { Layout as AntLayout } from 'antd';
// import { Header } from './Header';

export function Layout({
  head,
  children,
}: any){
  return (
    <AntLayout className="min-h-fullscreen p-2">
      <AntLayout className="p-2 border-4 border-sky-2 rounded-lg">
        {head}

        <AntLayout.Content className="flex flex-col">
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
