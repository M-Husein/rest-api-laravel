import { useState, useEffect } from 'react';
import { HttpError, useOne, useUpdate } from "@refinedev/core";
import { Transfer, Badge, Spin } from 'antd';
import { ButtonReload } from '@/components/ButtonReload';

export const Team = ({
  id,
  disabled,
}: any) => {
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
    resource: "team-member/getbyuser",
    id,
  });

  const datas = data?.data || [];
  const loadingData = isLoading || isFetching || isRefetching;
  const loadingAll = loadingData || isLoadingUpdate;

  useEffect(() => {
    if(!loadingData && !isError){
      setCurrent(datas.length ? datas.filter((item: any) => item.is_assigned).map((item: any) => item.team_id) : []);
    }
  }, [loadingData, isError, datas]);

  // console.log('datas: ', datas);

  const onChangeTransfer = (newTargetKeys: any) => {
    mutateUpdate(
      {
        resource: "team-member", // /api/team-member/assign
        id: "assign",
        values: {
          application_user_id: id,
          teams: newTargetKeys.filter(Boolean),
        },
      },
      {
        onSuccess: () => setCurrent(newTargetKeys),
      },
    );
  }

  return (
    <div className="p-4 lg_pr-8">
      <h2 className="text-lg flex">
        Team

        <ButtonReload
          className="ml-auto"
          disabled={loadingAll}
          loading={!isLoading && isRefetching}
          onClick={() => refetch()}
        />
      </h2>
        
      <Spin spinning={loadingAll}>
        <Transfer
          showSearch
          listStyle={{
            width: '100%',
            height: 'calc(100dvh - 263px)', // 400
            minHeight: 350,
          }}
          className="max-md_flex-col max-md_transfer-responsive"
          rowKey={(record) => record.team_id} // id
          dataSource={!loadingData && !isError ? datas : []}
          targetKeys={current}
          filterOption={(inputVal, option) => (option.team_name || '').toLowerCase().includes(inputVal.toLowerCase())}
          onChange={onChangeTransfer}
          disabled={disabled || loadingAll}
          render={(item) => item.team_name as string}
          titles={['Available', 'Current'].map((item) => (
            <Badge
              key={item} 
              count={item}
              color={item === 'Current' ? "green" : "gold"}
            />
          ))}
        />
      </Spin>
    </div>
  )
}
