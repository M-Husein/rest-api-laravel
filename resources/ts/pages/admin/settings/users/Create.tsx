import { useDocumentTitle } from "@refinedev/react-router-v6";
import { useCan } from "@refinedev/core";
import { Breadcrumb, Card, Tabs, Grid } from 'antd';
import { Link } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';
import { Profile } from './Profile';
import { Unauthorized } from '@/components/Unauthorized';

const Content = ({ title }: { title: string }) => {
  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  return (
    <>
      <Breadcrumb
        className="mb-3"
        items={[
          {
            title: <Link to="/settings/users">Users</Link>
          },
          { title: "Create" },
        ]}
      />

      <Card
        styles={{ body: { padding: 0 } }}
        title={title}
      >
        <Tabs
          tabPosition={isSmallDevice ? "top" : "left"}
          tabBarStyle={
            isSmallDevice ? {
              paddingLeft: 16,
              marginBottom: 0
            } : {
              padding: '1rem 0',
              minWidth: 200
            }
          }
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: <><UserOutlined className="mr-4" />Profile</>,
              children: <Profile />,
            },
          ]}
        />
      </Card>
    </>
  );
}

export default function Page() {
  const TITLE_PAGE = "Create User";

  useDocumentTitle(TITLE_PAGE + " - " + import.meta.env.VITE_APP_NAME);

  const { data: accessControl } = useCan({
    resource: "application_user",
    action: "list", // @ts-ignore
    params: { resource: { entity_name: "application_user" } }
  });

  if(!accessControl){
    return null;
  }

  return accessControl.can ? <Content title={TITLE_PAGE} /> : <Unauthorized />;
}
