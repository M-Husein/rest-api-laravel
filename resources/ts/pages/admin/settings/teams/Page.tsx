import { useState } from 'react';
import { useDocumentTitle } from "@refinedev/react-router-v6";
import type { TableColumnsType } from 'antd';
import { Breadcrumb, Button, Input, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { HttpError, useGetIdentity, useCan, useParsed, useDelete, useDeleteMany, useNavigation } from "@refinedev/core";
import { useTable, getDefaultSortOrder } from "@refinedev/antd";
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Link } from "react-router-dom";
import { Form } from '@/components/forms/Form';
import { ButtonReload } from '@/components/ButtonReload';
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { setOrders, getFilterItem, getColumnSearchProps } from '@/components/table/utils';
import { Unauthorized } from '@/components/Unauthorized';
import { confirms } from '@/constants/texts';

interface IPost {
  team_name: string;
}

const Content = ({ title }: { title: string }) => {
  const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const { data: currentUser } = useGetIdentity<any>();
  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useDelete();
  const { mutate: mutateDeleteMany, isLoading: isLoadingDeleteMany } = useDeleteMany();
  // const translate = useTranslate();
  const { push } = useNavigation();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);

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
  } = useTable({
    syncWithLocation: true,
    queryOptions: {
      enabled: !!current,
    },
    resource: "team/data-tables",
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
        columns: ["team_name", "business_unit_name"].map((name) => ({
          data: name,
          name,
          orderable: true,
          searchable: true,
          searchRegex: false,
          searchValue: getFilterItem(filters, name),
        })),
        orders: setOrders(sorters),
        search: { searchValue, searchRegex: false }
      },
    },
  });
  
  let loadingTable = isLoading || isFetching || isRefetching;

  const {
    formState: { errors },
    refineCore: { formLoading, onFinish },
    modal: { visible, close, show },
    control,
    handleSubmit,
    reset,
  } = useModalForm<IPost, HttpError, IPost>({
    refineCoreProps: {
      queryOptions: {
        enabled: false,
      },
      redirect: false,
      resource: "team/create",
      onMutationSuccess: () => refetch(),
    },
  });

  let loadingProcess = formLoading || isLoadingDelete || isLoadingDeleteMany;

  const onCancel = () => {
    close();
    reset();
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
      confirms.delete,
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDelete({
          resource: "team/delete",
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
          resource: "team/delete",
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
      title: 'Team Name',
      dataIndex: 'team_name',
      key: 'team_name',
      width: 315,
      sorter: (a: any, b: any) => a.team_name - b.team_name,
      sortOrder: getDefaultSortOrder('team_name', sorter),
      ...getColumnSearchProps('team_name'), // , filters
      render: (txt: any, row: any) => currentUser?.is_sysadmin ? <Link to={"/settings/teams/" + row.id} tabIndex={loadingProcess ? -1 : undefined}>{txt}</Link> : txt,
    },
    {  
      title: 'Company',
      dataIndex: 'business_unit_name',
      key: 'business_unit_name',
      width: 325,
      sorter: (a: any, b: any) => a.business_unit_name - b.business_unit_name,
      sortOrder: getDefaultSortOrder('business_unit_name', sorter),
      ...getColumnSearchProps('business_unit_name'),
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
              disabled={loadingProcess}
              onClick={() => push('/settings/teams/' + row.id)}
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
                disabled={loadingProcess}
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
            onClick={() => show('')}
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
      <Breadcrumb
        className="mb-3"
        items={[
          { title: "Settings" },
          { title, },
        ]}
      />

      <Table
        {...tableProps}
        className="antTable max-md_antTable-xs"
        scroll={{ x: 1115 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={tableProps.pagination}
        loading={loadingTable}
        columns={columns}
        title={renderTitle}
      />

      <Modal
        width={450}
        keyboard={false}
        maskClosable={false}
        closeIcon={!formLoading}
        title="Create New Team"
        okText="Save" // {translate('buttons.save')}
        okButtonProps={{
          htmlType: "submit",
          form: "formModal",
          loading: formLoading,
        }}
        cancelButtonProps={{ disabled: formLoading }}
        // footer={(x: any, { OkBtn }: any) => <OkBtn />}
        open={visible}
        onCancel={onCancel}
        afterOpenChange={(open) => { // @ts-ignore
          open && document.getElementById('teamName')?.focus?.()
        }}
      >
        <Form
          className="mt-6"
          id="formModal"
          onSubmit={handleSubmit(onFinish)}
        >
          <label htmlFor="teamName" className="mb-1">Team Name</label>
          <Controller
            name="team_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="teamName"
                status={errors.team_name ? "error" : ""}
              />
            )}
            rules={{
              required: "is required",
              pattern: {
                value: /\S/g,
                message: 'No leading and trailing whitespace'
              },
            }}
          />
          {errors.team_name && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.team_name.message}
            </div>
          )}
        </Form>
      </Modal>

      {modalContextHolder}
    </>
  );
}

export default function Page() {
  const TITLE_PAGE = "Teams"; // Team Management
  
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
