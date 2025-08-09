import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { useParsed, useCreate } from "@refinedev/core"; // HttpError, useOne, useNotification, useUpdate
// import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Card, Tabs, Grid, Modal } from 'antd';
import { TranslationOutlined } from '@ant-design/icons'; // ToolOutlined, 
import { Info } from '@/components/Info';
import { ClearCache } from "@/components/ClearCache";
import { Translations } from './parts/Translations';
import { UserLogged } from './parts/UserLogged';

export default function Page(){
  useDocumentTitle("Settings App - " + APP.name);

  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const [modalApi, modalContextHolder] = Modal.useModal();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreate();
  const { params } = useParsed<any>(); // : { current, pageSize, sorters, filters }
  // const [searchParams, setSearchParams] = useSearchParams();
  const [tabActive, setTabActive] = useState(params.tab || "0"); // searchParams.get('tab')
  // const tabActive = searchParams.get('tab') || "0";

  // console.log('tabActive: ', tabActive);

  const revokeUserTokens = (row: any, refetch: any, cb: any) => {
    const confirms = modalApi.confirm({
      centered: true,
      keyboard: false,
      title: "Are you sure to revoke this user tokens?",
      cancelButtonProps: { disabled: false },
      onOk: () => new Promise((resolve, reject) => {
        const updateConfirms = (disabled: boolean) => confirms.update({
          cancelButtonProps: { disabled }
        });

        updateConfirms(true);

        mutateCreate({
          resource: "revoke-tokens",
          values: {
            user_id: row.id
          },
        }, {
          onSuccess: (res) => {
            refetch();
            cb?.(null);
            resolve(res);
          },
          onError: (e) => {
            updateConfirms(false);
            reject(e);
          },
        });
      })
    });
  }

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
          className="tab-full"
          activeKey={tabActive}
          onChange={(tab) => {
            setTabActive(tab);
            // setSearchParams(prev => ({ ...prev, tab }));
          }}
          items={[
            {
              key: "0",
              label: <><b className="mr-4">ℹ️</b>Information</>,
              className: "h-full",
              children: (
                <Info className="h-full">
                  <h2>Information</h2>
                </Info>
              )
            },
            {
              key: "1",
              label: <><b className="mr-4">👥</b>User logged</>,
              children: (
                <div className="py-4 md_pr-4">
                  <UserLogged 
                    {...params} 
                    onClickLogout={revokeUserTokens}
                  />
                </div>
              )
            },
            {
              key: "2",
              label: <><TranslationOutlined className="mr-4" />Translations</>,
              disabled: isPendingCreate,
              children: (
                <div className="py-4 md_pr-4">
                  <Translations 
                    {...params}
                    fixedAction={!isSmallDevice}
                  />
                </div>
              ),
            },
            {
              key: "3",
              label: <><b className="mr-4">🛠️</b>Maintenance</>, // <ToolOutlined className="mr-4" />
              disabled: isPendingCreate,
              className: "!p-0",
              children: (
                // py-4 md_px-4 max-md_px-4
                <div className="p-4">
                  <ClearCache />

                  <h3 className="mt-4">DB (Dev)</h3>
                  <ol>
                    <li>Backup</li>
                    <li>Export / Download</li>
                  </ol>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {modalContextHolder}
    </>
  );
}
