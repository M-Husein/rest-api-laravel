import { useState, useEffect } from 'react';
import { HttpError, useOne, useUpdate } from "@refinedev/core"; // useTranslate
import { Transfer, Badge, Spin } from 'antd';
import { ButtonReload } from '@/components/ButtonReload';

export const Roles = ({
  id,
  disabled,
}: any) => {
  // const translate = useTranslate();
  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useUpdate();
  const [current, setCurrent] = useState<any>([]);
  
  const {
    data, 
    isLoading, 
    isFetching, 
    isRefetching, 
    isError,
    refetch,
  } = useOne<any, HttpError>({
    queryOptions: {
      enabled: !!id,
    },
    resource: "team-role/getbyteam", // /api/team-role/getbyteam/{TeamId}
    id,
  });
  
  const datas = data?.data;
  const loadingData = isLoading || isFetching || isRefetching;
  const loadingAll = loadingData || isLoadingUpdate;

  useEffect(() => {
    if(!loadingData && !isError){
      setCurrent(datas?.length ? datas.filter((item: any) => item.is_assigned).map((item: any) => item.application_role_id) : []);
    }
  }, [loadingData, isError, datas]);
  // console.log('datas: ', datas);

  const onChangeTransfer = (newTargetKeys: any) => { // string[]
    mutateUpdate(
      {
        resource: "team-role", // team-role/update
        id: "update",
        values: {
          team_id: id,
          roles: newTargetKeys.filter(Boolean), // v => v
        },
      },
      {
        onSuccess: () => setCurrent(newTargetKeys),
      },
    );
  }

  return (
    <div className="p-4 lg_py-8 lg_pr-8">
      <h2 className="text-lg flex">
        Roles

        <ButtonReload
          className="ml-auto"
          disabled={loadingAll} // disabled || loadingAll
          loading={!isLoading && isRefetching}
          onClick={() => refetch()}
        />
      </h2>

      <Spin spinning={loadingAll}>
        <Transfer
          rowKey={(record) => record.application_role_id} // id
          dataSource={!loadingData && !isError ? datas || [] : []}
          targetKeys={current}
          filterOption={(inputVal, option) => (option.role_name || '').toLowerCase().includes(inputVal.toLowerCase())}
          onChange={onChangeTransfer}
          disabled={disabled || loadingAll}
          render={(item) => item.role_name as string}
          titles={['Available', 'Current'].map((item: string) => (
            <Badge
              key={item} 
              count={item}
              color={item === 'Current' ? "green" : "gold"}
            />
          ))}
          // status="error"
          showSearch
          listStyle={{
            width: '100%',
            height: 400,
          }}
          className=" max-md_flex-col max-md_transfer-responsive"
        />
      </Spin>
    </div>
  );
}
