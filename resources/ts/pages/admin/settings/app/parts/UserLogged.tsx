import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { HttpError, useOne, useDelete } from "@refinedev/core"; // , useParsed, useTranslate, useGetIdentity
import { useTable } from "@refinedev/antd"; // , getDefaultSortOrder
import { Button, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { ButtonReload } from '@/components/ButtonReload';

export const UserLogged = ({ 
  current, pageSize, sorters, filters,
  onClickLogout,
}: any) => {
  // const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDelete();
  const [dataModalDetail, setDataModalDetail] = useState<any>();

  const {
    tableProps,
    // sorter,
    tableQuery: { 
      // data: tableData, 
      isLoading, 
      isFetching, 
      isRefetching, 
      refetch 
    },
    // setCurrent,
  } = useTable<any, HttpError>({
    syncWithLocation: true,
    queryOptions: {
      enabled: !!current,
    },
    resource: "user-tokens",
    pagination: { pageSize, current },
    sorters: { initial: sorters },
    filters: { initial: filters },
    // meta: {
    //   q: searchValue,
    // }
  });

  const {
    data,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isRefetching: isRefetchingDetail,
    refetch: refetchDetail,
  } = useOne<any, HttpError>({
    queryOptions: {
      enabled: !!dataModalDetail?.id
    },
    resource: "user-tokens",
    id: dataModalDetail?.id,
  });

  let loadingDetail = isLoadingDetail || isFetchingDetail || isRefetchingDetail;
  // console.log('data: ', data);

  const revokePerDevice = (row: any) => {
    const confirms = modalApi.confirm({
      centered: true,
      keyboard: false,
      title: "Are you sure to revoke this user device",
      cancelButtonProps: { disabled: false },
      onOk: () => new Promise((resolve, reject) => {
        const updateConfirm = (disabled: boolean) => confirms.update({
          cancelButtonProps: { disabled }
        });

        updateConfirm(true);

        mutateDelete({
          resource: "user-tokens/" + dataModalDetail.id,
          id: row.id,
        }, {
          onSuccess: (res) => {
            if(data?.data.length < 2){
              refetch(); // Reload User logged
              setDataModalDetail(null); // Close modal detail per user
            }else{
              refetchDetail();
            }
            
            resolve(res);
          },
          onError: (e) => {
            updateConfirm(false);
            reject(e);
          },
        });
      })
    });
  }

  const renderTitle = () => (
    <Header
      title="User logged"
      content={
        <ButtonReload
          // disabled={formLoading}
          loading={!isLoading && isRefetching}
          onClick={() => refetch()}
        />
      }
      // onSearch={(val: any) => {
      //   current > 1 && setCurrent(1);
      //   setSearchValue(() => val)
      // }}
    />
  );

  const columns: TableColumnsType<any> = [
    {  
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 45,
    },
    {  
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 95,
      render: (txt: any, row: any) => (
        <Link to={"/app/users/" + row.id}>
          {txt}
        </Link>
      )
    },
    {  
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 105,
      render: (txt: any) => (
        <a href={"mailto:" + txt}>
          {txt}
        </a>
      )
    },
    {
      title: '',
      dataIndex: '',
      key: '',
      align: 'center',
      width: 55,
      render: (txt: any, row: any) => (
        <>
          <Button
            danger
            icon={<b>👁️</b>}
            size="small"
            title="Show detail"
            onClick={() => setDataModalDetail(row)}
          />
          {' '}
          <Button
            danger
            icon={<b>❌</b>}
            size="small"
            title="Logout/Revoke token"
            onClick={() => onClickLogout(row, refetch)}
          />
        </>
      )
    }
  ];

  return (
    <>
      <Table
        {...tableProps}
        className="antTable max-md_antTable-xs"
        scroll={{ x: 975 }}
        loading={isLoading || isFetching || isRefetching}
        columns={columns}
        title={renderTitle}
      />

      <Modal
        keyboard={false}
        maskClosable={false}
        title={
          <>
            Detail: {dataModalDetail?.name && <Link to={"/app/users/" + dataModalDetail.id}>{dataModalDetail?.name}</Link>}
          </>
        }
        width={{
          xs: '100%',
          md: '65%',
        }}
        // className="!max-w-full"
        classNames={{
          body: "-mx-6",
          footer: "flex justify-center"
        }}
        okText="Logout all"
        cancelText="Close"
        okButtonProps={{
          onClick: () => onClickLogout(dataModalDetail, refetch, setDataModalDetail)
        }}
        open={!!dataModalDetail}
        onCancel={() => setDataModalDetail(null)}
      >
        {dataModalDetail && (
          <Table
            className="antTable max-md_antTable-xs"
            virtual
            scroll={{ x: 975, y: 750 }}
            loading={loadingDetail}
            dataSource={data?.data}
            columns={[
              {  
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 95,
              },
              {  
                title: 'Expires',
                dataIndex: 'expires_at',
                key: 'expires_at',
                width: 75,
              },
              {  
                title: 'User agent',
                dataIndex: 'user_agent',
                key: 'user_agent',
                width: 135,
              },
              {  
                title: 'Ip address',
                dataIndex: 'ip_address',
                key: 'ip_address',
                width: 105,
              },
              {
                title: '',
                dataIndex: 'x',
                key: 'x',
                align: 'center',
                width: 45,
                render: (txt: any, row: any) => (
                  <Button
                    danger
                    size="small"
                    icon={<b>❌</b>}
                    title="Revoke"
                    disabled={isPendingDelete}
                    onClick={() => revokePerDevice(row)}
                  />
                )
              }
            ]}
          />
        )}
      </Modal>

      {modalContextHolder}
    </>
  );
}
