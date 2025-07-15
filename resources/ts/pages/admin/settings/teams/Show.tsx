import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useCan, useParsed, useOne } from "@refinedev/core";
import { Breadcrumb, Card, Tabs, Grid } from 'antd';
import { Link } from "react-router-dom";
import { FaUser, FaGear, FaUsers } from "react-icons/fa6"; // , FaArrowRight, FaMagnifyingGlassChart
import { Profile } from './parts/Profile';
import { Roles } from './parts/Roles';
import { Members } from './parts/Members';
import { Unauthorized } from '@/components/Unauthorized';

const Content = ({ title }: { title: string }) => {
  const { id: teamId } = useParsed<any>();

  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const {
    data: dataDetail, 
    isLoading, 
    isFetching, 
    isRefetching, 
    isError,
    refetch,
  } = useOne<any, HttpError>({
    resource: "team",
    id: teamId,
  });

  const loadingData = isLoading || isFetching || isRefetching;
  // @ts-ignore
  const detail = dataDetail?.data || {};
  const team_name = detail?.team_name || "";
  // console.log('dataDetail: ', dataDetail);

  return (
    <>
      <Breadcrumb
        className="mb-3"
        items={[
          { title: 'Settings' },
          {
            title: <Link to="/settings/teams">Teams</Link>,
          },
          // { title: loadingData ? "" : team_name || "Edit" },
          { title: "Edit" }
        ]}
      />

      <Card
        bordered={false}
        styles={{ body: { padding: 0 } }}
        className="shadow"
        title={<h1 className="text-xl mb-0">{title}</h1>}
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
              label: <><FaUser className="mr-4" />Profile</>,
              disabled: loadingData,
              children: (
                <Profile
                  refetch={refetch}
                  loading={loadingData}
                  isLoading={isLoading}
                  isRefetching={isRefetching}
                  disabled={isError}
                  values={{ 
                    id: detail.id, 
                    team_name,
                    application_report_id: detail.application_report_id
                  }}
                />
              ),
            },
            {
              key: "2",
              label: <><FaGear className="mr-4" />Roles</>,
              disabled: loadingData,
              children: <Roles id={teamId} disabled={isError} />,
            },
            {
              key: "3",
              label: <><FaUsers className="mr-4" />Members</>,
              disabled: loadingData,
              children: <Members id={teamId} disabled={isError} />,
            },
          ]}
        />
      </Card>
    </>
  );
}

export default function Show() {
  const TITLE_PAGE = "Team Detail";

  useDocumentTitle(TITLE_PAGE + " • " + import.meta.env.VITE_APP_NAME); 

  const { data: accessControl } = useCan({
    resource: "team",
    action: "list", // @ts-ignore
    params: { resource: { entity_name: "team" } }
  });

  if(!accessControl){
    return null;
  }

  return accessControl.can ? <Content title={TITLE_PAGE} /> : <Unauthorized />;
}
