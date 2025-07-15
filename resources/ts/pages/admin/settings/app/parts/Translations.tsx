import type { TableColumnsType } from 'antd'; // TableProps
import { useState } from 'react';
import { HttpError, useGetIdentity, useParsed } from "@refinedev/core"; // useCreate, useOne, useNotification, useUpdate
import { useTable, getDefaultSortOrder } from "@refinedev/antd";
import { useForm } from "@refinedev/react-hook-form"; // useModalForm
import { Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // CheckOutlined
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { getColumnSearchProps } from '@/components/table/utils'; // setOrders, getFilterItem, 
import { ButtonReload } from '@/components/ButtonReload';
import { FormModal } from './FormModal';

const API = "app-translations";

export const Translations = ({
  fixedAction,
}: any) => {
  const { data: currentUser } = useGetIdentity<any>();
  const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [dataForm, setDataForm] = useState<any>();

  const {
    tableProps,
    sorter,
    tableQuery: { 
      // data: tableData, 
      isLoading, 
      isFetching, 
      isRefetching, 
      refetch 
    },
    setCurrent,
  } = useTable<any, HttpError>({
    syncWithLocation: true,
    queryOptions: {
      enabled: !!current,
    },
    resource: API,
    pagination: { pageSize, current },
    sorters: { initial: sorters },
    filters: { initial: filters },
    meta: {
      q: searchValue,
    }
  });

  // console.log('filters: ', filters);
  // console.log('sorters: ', sorters);
  // console.log('currentUser: ', currentUser);

  let loadingTable = isLoading || isFetching || isRefetching;

  const {
    formState: { errors },
    refineCore: { onFinish, formLoading },
    // modal: { visible, show, close },
    control,
    reset,
    handleSubmit,
  } = useForm<any, HttpError, any>({
    values: dataForm,
    refineCoreProps: {
      queryOptions: { enabled: false },
      redirect: false,
      resource: API,
      action: dataForm?.id ? "edit" : "create",
      id: dataForm?.id,
      onMutationSuccess(){
        // onCancel(null);
        setDataForm(null);
      },
    },
  });

  const doCancel = () => {
    setDataForm(null);
    reset({});
  }

  const doSubmit = (newValues: any) => {
    onFinish({ ...newValues, is_custom: true });
  }

  const columns: TableColumnsType<any> = [
    {  
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      width: 215,
      sorter: (a: any, b: any) => a.country_name - b.country_name,
      sortOrder: getDefaultSortOrder('group', sorter),
      ...getColumnSearchProps('group'),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: 195,
      sortOrder: getDefaultSortOrder('key', sorter),
      ...getColumnSearchProps('key'),
    },
    {
      title: 'Custom',
      dataIndex: 'is_custom',
      key: 'is_custom',
      width: 35,
      align: 'center',
      render: (txt: any) => !!txt && "✅" // txt ? "✅" : "❌"
    },
    {
      title: '',
      dataIndex: 'x',
      key: 'x',
      align: 'center',
      fixed: fixedAction ? 'right' : undefined,
      width: 65,
      render: (txt: any, row: any) => {
        return currentUser?.role && currentUser?.roles.key === 'admin' && (
          <>
            <Button
              title="Edit"
              size="small"
              ghost
              type="primary"
              disabled={formLoading}
              icon={<EditOutlined />}
              onClick={() => setDataForm(row)} // push('/settings/users/' + row.id)
            />
            {' '}
            {!!row.is_custom && (
              <Button
                title="Delete"
                size="small"
                type="primary"
                ghost
                danger
                disabled={formLoading}
                icon={<DeleteOutlined />}
                // onClick={() => clickDelete(row)}
              />
            )}
          </>
        );
      },
    },
  ];

  const renderTitle = () => (
    <Header
      title="App Translations" // {title}
      content={
        <>
          {!!selectedRowKeys.length && (
            <Button
              danger
              type="primary"
              disabled={formLoading}
              // onClick={() => onClickDeleteRows(selectedRowKeys)}
            >
              Delete selected ({selectedRowKeys.length})
            </Button>
          )}

          <ButtonReload
            // disabled={isLoadingDelete || isLoadingDeleteMany}
            disabled={formLoading}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />

          <Button
            type="primary"
            disabled={formLoading}
            onClick={() => setDataForm({})} // push('/settings/users/create')
          >
            Create
          </Button>
        </>
      }
      onSearch={(val: any) => {
        current > 1 && setCurrent(1);
        setSearchValue(() => val)
      }}
    />
  );

  return (
    <>
      <Table
        {...tableProps}
        className="antTable max-md_antTable-xs"
        scroll={{ x: 1115 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        loading={loadingTable}
        columns={columns}
        title={renderTitle}
      />

      {modalContextHolder}

      <FormModal
        control={control}
        errors={errors}
        disabled={formLoading}
        values={dataForm}
        onSubmit={handleSubmit(doSubmit)}
        onCancel={doCancel}
      />
    </>
  );
}
