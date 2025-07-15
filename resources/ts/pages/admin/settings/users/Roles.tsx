import { useState, useEffect } from 'react';
import { HttpError, useOne, useUpdate } from "@refinedev/core";
import { Transfer, Badge, Spin } from 'antd';
import { ButtonReload } from '@/components/ButtonReload';

export const Roles = ({
  id,
  disabled,
}: any) => {
  const [current, setCurrent] = useState<any>([]);
  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useUpdate();
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
    resource: "user-role/getbyuser",
    id,
  });

  const datas = data?.data || [];
  const loadingData = isLoading || isFetching || isRefetching;
  const loadingAll = loadingData || isLoadingUpdate;

  useEffect(() => {
    if(!loadingData && !isError){
      setCurrent(datas.length ? datas.filter((item: any) => item.is_assigned).map((item: any) => item.application_role_id) : []);
    }
  }, [loadingData, isError, datas]);

  // console.log('datas: ', datas);

  const onChangeTransfer = (newTargetKeys: any) => {
    mutateUpdate(
      {
        resource: "user-role", // /api/user-role/update
        id: "update",
        values: {
          application_user_id: id,
          roles: newTargetKeys.filter(Boolean),
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
        Roles

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
          rowKey={(record) => record.application_role_id} // id
          dataSource={!loadingData && !isError ? datas : []}
          targetKeys={current}
          filterOption={(inputVal, option) => (option.role_name || '').toLowerCase().includes(inputVal.toLowerCase())}
          onChange={onChangeTransfer}
          disabled={disabled || loadingAll}
          render={(item) => item.role_name as string}
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
