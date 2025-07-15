// import { useState, useEffect } from 'react';
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useCan, useOne, useParsed } from "@refinedev/core";
import { Breadcrumb, Card, Tabs, Grid } from 'antd'; // , Modal, message, Upload
import { UserOutlined, SettingOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import { ButtonReload } from '@/components/ButtonReload';
import { Profile } from './Profile';
import { Roles } from './Roles';
import { Team } from './Team';
import { Unauthorized } from '@/components/Unauthorized';

const Content = ({ title }: { title: string }) => {
  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const { id } = useParsed();
  
  const {
    data: dataUser,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    isRefetching: isRefetchingUser,
    isError: isErrorUser,
    refetch,
  } = useOne<any, HttpError>({
    queryOptions: {
      enabled: !!id,
    },
    resource: "application-user",
    id,
  });
  
  let loadingUser = isLoadingUser || isFetchingUser || isRefetchingUser;
  // @ts-ignore
  let userData = dataUser?.data || {};
  // console.log('dataUser: ', dataUser);

  return (
    <>
      <Breadcrumb
        className="mb-3"
        items={[
          {
            title: <Link to="/settings/users">Users</Link>
          },
          { title: "Edit" }
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
          defaultActiveKey="profile"
          items={[
            {
              key: "profile",
              label: <><UserOutlined className="mr-4" />Profile</>,
              disabled: loadingUser,
              children: (
                <Profile
                  loading={loadingUser}
                  disabled={isErrorUser}
                  values={loadingUser || isErrorUser ? null : {
                    id: userData.id,
                    fullname: userData.fullname,
                    application_username: userData.application_username,
                    email_address: userData.email_address,
                    // primary_team_id: userData.primary_team_id,
                    // primary_team_name: userData.primary_team_name,
                    salutation: userData.salutation,
                    phone_number: userData.phone_number,
                    description: userData.description,
                  }}
                  start={
                    <ButtonReload
                      className="float-right mr-4 lg_mr-8"
                      disabled={loadingUser}
                      loading={!isLoadingUser && isRefetchingUser}
                      onClick={() => refetch()}
                    />
                    // <h2 className="text-lg flex mt-4 px-4 lg_pr-8">
                    //   Profile
                    //   <ButtonReload
                    //     className="ml-auto"
                    //     disabled={loadingUser}
                    //     loading={!isLoadingUser && isRefetchingUser}
                    //     onClick={() => refetch()}
                    //   />
                    // </h2>
                  }
                />
              ),
            },
            ...(isLoadingUser || isErrorUser ? [] : [
              {
                key: "roles",
                label: <><SettingOutlined className="mr-4" />Roles</>,
                disabled: loadingUser,
                children: <Roles id={id} disabled={isErrorUser} />,
              },
              {
                key: "team",
                label: <><UsergroupAddOutlined className="mr-4" />Team</>,
                disabled: loadingUser,
                children: <Team id={id} disabled={isErrorUser} />,
              },
            ])
          ]}
        />
      </Card>
    </>
  );
}

export default function Show() {
  const TITLE_PAGE = "User Detail";

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
