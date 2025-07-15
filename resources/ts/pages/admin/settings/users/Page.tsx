import type { TableColumnsType } from 'antd'; // TableProps
import { useState } from 'react';
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useCan, useGetIdentity, useParsed, useDelete, useDeleteMany, useNavigation } from "@refinedev/core";
import { useTable, getDefaultSortOrder } from "@refinedev/antd";
import { Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { setOrders, getFilterItem, getColumnSearchProps } from '@/components/table/utils';
import { ButtonReload } from '@/components/ButtonReload';
import { Unauthorized } from '@/components/Unauthorized';
import { confirms } from '@/constants/texts';

const API = "application-user/";

const Content = ({ title }: { title: string }) => {
  const { data: currentUser } = useGetIdentity<any>();
  const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useDelete();
  const { mutate: mutateDeleteMany, isLoading: isLoadingDeleteMany } = useDeleteMany();
  const { push } = useNavigation();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]); // React.Key[]

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
    resource: API + "data-tables",
    pagination: { pageSize, current },
    sorters: { initial: sorters },
    filters: { initial: filters },
    meta: {
      method: "post",
      json: {
        draw: 0,
        start: 0,
        length: pageSize,
        page: current,
        columns: [
          'application_username',
          'fullname',
          'email_address',
          // 'is_administrator', 
          // 'is_sysadmin',
        ].map((name: string) => ({
          data: name,
          name,
          orderable: true,
          searchable: true,
          searchRegex: true,
          searchValue: getFilterItem(filters, name),
        })),
        orders: setOrders(sorters),
        search: { searchValue, searchRegex: true }
      },
    },
  });

  let loadingTable = isLoading || isFetching || isRefetching;

  const confirmModal = (title: any, callback: (fn: any) => void): void => {
    const modalConfirm = modalApi.confirm({
      keyboard: false,
      centered: true,
      title,
      cancelButtonProps: { disabled: false },
      onOk(){
        const updateConfirm = (disabled: boolean) => {
          modalConfirm.update({
            cancelButtonProps: { disabled }
          })
        }

        updateConfirm(true);

        return callback(updateConfirm);
      },
    });
  }

  const clickDelete = (data: any) => {
    confirmModal(
      confirms.delete,
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDelete({
          resource: API + "delete",
          id: data.id,
        }, {
          onError: (e) => {
            updateConfirm(false)
            reject(e)
          },
          onSuccess: (data: any) => {
            refetch();
            resolve(data);
          },
        });
      })
    );
  }

  const onClickDeleteRows = async (ids: Array<string | number>) => {
    confirmModal(
      confirms.deletes,
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDeleteMany({
          ids,
          resource: API + "delete",
        }, {
          onError: (e) => {
            updateConfirm(false)
            reject(e)
          },
          onSuccess: (data: any) => {
            setSelectedRowKeys([]);
            refetch();
            resolve(data);
          },
        });
      })
    );
  }

  // console.log('filters: ', filters)

  const columns: TableColumnsType<any> = [
    {  
      title: 'Username',
      dataIndex: 'application_username',
      key: 'application_username',
      width: 135,
      sorter: (a: any, b: any) => a.application_username - b.application_username,
      sortOrder: getDefaultSortOrder('application_username', sorter),
      ...getColumnSearchProps('application_username'), // , filters
      render: (txt: any, row: any) => currentUser?.is_sysadmin ? <Link to={"/settings/users/" + row.id}>{txt}</Link> : txt,
    },
    {
      title: 'Fullname',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 195,
    },
    {  
      title: 'Email',
      dataIndex: 'email_address',
      key: 'email_address',
      width: 215,
      sorter: (a: any, b: any) => a.email_address - b.email_address,
      sortOrder: getDefaultSortOrder('email_address', sorter),
      ...getColumnSearchProps('email_address'), // , filters
      render: (txt: any) => txt && <a href={"mailto:" + txt}>{txt}</a>
    },
    {
      title: 'Administrator',
      dataIndex: 'is_administrator',
      key: 'is_administrator',
      width: 115,
      align: 'center',
      render: (txt: any) => txt && <CheckOutlined />
    },
    {
      title: 'System Administrator',
      dataIndex: 'is_sysadmin',
      key: 'is_sysadmin',
      width: 115,
      align: 'center',
      render: (txt: any) => txt && <CheckOutlined />
    },
    {
      title: '',
      dataIndex: 'x',
      key: 'x',
      align: 'center',
      fixed: 'right',
      width: 65,
      render: (txt: any, row: any) => {
        return currentUser?.is_sysadmin && (
          <>
            <Button
              title="Edit"
              size="small"
              ghost
              type="primary"
              icon={<EditOutlined />}
              onClick={() => push('/settings/users/' + row.id)}
            />
            {' '}
            {!row.is_sysadmin && (
              <Button
                title="Delete"
                size="small"
                type="primary"
                ghost
                danger
                icon={<DeleteOutlined />}
                onClick={() => clickDelete(row)}
              />
            )}
          </>
        );
      },
    },
  ];

  const renderTitle = () => (
    <Header
      title={title}
      content={
        <>
          {!!selectedRowKeys.length && (
            <Button
              danger
              type="primary"
              onClick={() => onClickDeleteRows(selectedRowKeys)}
            >
              Delete selected ({selectedRowKeys.length})
            </Button>
          )}

          <ButtonReload
            disabled={isLoadingDelete || isLoadingDeleteMany}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />

          <Button
            type="primary"
            onClick={() => push('/settings/users/create')}
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
        className="antTable max-md_antTable-xs" //  mt-4
        scroll={{ x: 1115 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        // pagination={tableProps.pagination}
        loading={loadingTable}
        columns={columns}
        title={renderTitle}
      />

      {modalContextHolder}
    </>
  );
}

export default function Page(){
  const TITLE_PAGE = "Users";

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
