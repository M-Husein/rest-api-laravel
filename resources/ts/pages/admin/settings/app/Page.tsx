import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
// import { useCreate } from "@refinedev/core"; // HttpError, useOne, useNotification, useUpdate
import { Breadcrumb, Card, Tabs, Grid } from 'antd';
import { ToolOutlined, TranslationOutlined } from '@ant-design/icons';
import { ClearCache } from "@/components/ClearCache";
import { Translations } from './parts/Translations';

export default function Page(){
  useDocumentTitle("Settings App - " + import.meta.env.VITE_APP_NAME);

  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const [tabActive, setTabActive] = useState("0");

  return (
    <>
      <Breadcrumb
        className="mb-2"
        items={[
          { title: "Settings" },
          { title: "App" }
        ]}
      />

      <Card 
        styles={{ body: { padding: 0 } }}
        title="Settings App"
        className="shadow"
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
          activeKey={tabActive}
          onChange={setTabActive}
          items={[
            // {
            //   key: "0",
            //   label: "",
            //   children: "Select"
            // },
            {
              key: "1",
              label: <><TranslationOutlined className="mr-4" />Translations</>,
              // disabled: loadingUser,
              children: (
                <div className="py-4 md_pr-4">
                  <Translations fixedAction={!isSmallDevice} />
                </div>
              ),
            },
            {
              key: "2",
              label: <><ToolOutlined className="mr-4" />Maintenance</>,
              // disabled: loadingUser,
              children: (
                <div className="py-4">
                  <ClearCache />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
