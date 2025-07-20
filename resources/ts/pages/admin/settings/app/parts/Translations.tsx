import type { TableColumnsType } from 'antd'; // TableProps
import { useState } from 'react';
import { HttpError, useTranslate, useGetIdentity, useParsed, useDelete, useDeleteMany } from "@refinedev/core"; // useCreate, useOne, useNotification, useUpdate
import { useTable, getDefaultSortOrder } from "@refinedev/antd";
import { useForm } from "@refinedev/react-hook-form"; // useModalForm
// import { useForm } from '@/utils/hooks/useForm';
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
  const translate = useTranslate();
  const { mutate: mutateDelete, isPending: isLoadingDelete } = useDelete();
  const { mutate: mutateDeleteMany, isPending: isLoadingDeleteMany } = useDeleteMany();
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

  // let loadingTable = isLoading || isFetching || isRefetching;

  const {
    formState: { errors },
    refineCore: { onFinish, formLoading },
    // modal: { visible, show, close },
    control,
    reset,
    handleSubmit,
  } = useForm({ // <any, HttpError, any>
    values: dataForm,
    refineCoreProps: {
      // queryOptions: { enabled: false },
      // redirect: false,
      resource: API,
      action: dataForm?.id ? "edit" : "create",
      id: dataForm?.id,
      onMutationSuccess(){
        doCancel();
      },
      // successNotification: (resData: any) => ({
      //   type: "success",
      //   message: resData.message,
      //   description: resData.description || translate('notifications.success')
      // }),
    },
  });

  const doCancel = () => {
    setDataForm(null);
    reset({});
  }

  const doSubmit = (newValues: any) => {
    onFinish({ ...newValues, is_custom: true });
  }

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
      translate('confirms.delete'),
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDelete({
          resource: API,
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
      translate('confirms.delete'),
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDeleteMany({
          ids,
          resource: API + "/deletes",
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

  const columns: TableColumnsType<any> = [
    {  
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      width: 215,
      sorter: (a: any, b: any) => a.group - b.group,
      sortOrder: getDefaultSortOrder('group', sorter),
      ...getColumnSearchProps('group'),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: 195,
      sorter: (a: any, b: any) => a.key - b.key,
      sortOrder: getDefaultSortOrder('key', sorter),
      ...getColumnSearchProps('key'),
    },
    {
      title: 'Custom',
      dataIndex: 'is_custom',
      key: 'is_custom',
      width: 45,
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
      title="Translations" // {title}
      content={
        <>
          {!!selectedRowKeys.length && (
            <Button
              danger
              type="primary"
              disabled={formLoading || isLoadingDeleteMany}
              onClick={() => onClickDeleteRows(selectedRowKeys)}
            >
              Delete selected ({selectedRowKeys.length})
            </Button>
          )}

          <ButtonReload
            disabled={formLoading || isLoadingDelete || isLoadingDeleteMany}
            // disabled={formLoading}
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

  // console.log('tableProps: ', tableProps);

  return (
    <>
      <Table
        {...tableProps}
        className="antTable max-md_antTable-xs"
        scroll={{ x: 975 }} // , y: 750
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (row: any) => ({
            disabled: !row.is_custom, // Disable checkbox for 'inactive' rows
            className: row.is_custom ? "" : "content-v-hide",
            // style: row.is_custom ? {} : { contentVisibility: 'hidden' }
          }),
          // renderCell: (checked: any, row: any, index: any, originNode: any) => {
          //   if (row.is_custom) {
          //     return originNode;
          //   }
          //   return null; // Hide checkbox for this row
          // },
        }}
        loading={isLoading || isFetching || isRefetching} // loadingTable
        columns={columns}
        title={renderTitle}
      />

      {modalContextHolder}

      <FormModal
        t={translate}
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
