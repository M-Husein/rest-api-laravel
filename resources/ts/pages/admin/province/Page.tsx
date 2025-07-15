import { useState } from 'react';
import { useDocumentTitle } from "@refinedev/react-router-v6";
import type { TableColumnsType } from 'antd';
import { Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetIdentity, useCan, useParsed, useDelete, useDeleteMany } from "@refinedev/core"; // useNavigation
import { useTable, getDefaultSortOrder } from "@refinedev/antd";
// import { Link } from "react-router-dom";
import { ButtonReload } from '@/components/ButtonReload';
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { setOrders, getFilterItem, getColumnSearchProps } from '@/components/table/utils';
import { Unauthorized } from '@/components/Unauthorized';
import { confirms } from '@/constants/texts';
import { FormModal } from './FormModal';

const Content = ({ title }: { title: string }) => {
  const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const { data: currentUser } = useGetIdentity<any>();
  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useDelete();
  const { mutate: mutateDeleteMany, isLoading: isLoadingDeleteMany } = useDeleteMany();
  // const translate = useTranslate();
  // const { push } = useNavigation();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [formValues, setFormValues] = useState<any>();

  const {
    tableProps,
    sorter,
    tableQuery: {
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
    resource: "province/data-tables",
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
        columns: ["province_name", "country_name"].map((name) => ({
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
  let loadingProcess = isLoadingDelete || isLoadingDeleteMany;

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

  const clickDelete = (id: any) => {
    confirmModal(
      confirms.delete,
      (updateConfirm) => new Promise((resolve, reject) => {
        mutateDelete({
          resource: "province/delete",
          id,
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
          resource: "province/delete",
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

  const toggleFormModal = (val: any) => {
    setFormValues(val);
    val === null && refetch();
  }

  const columns: TableColumnsType<any> = [
    {  
      title: 'Province',
      dataIndex: 'province_name',
      key: 'province_name',
      width: 325,
      sorter: (a: any, b: any) => a.province_name - b.province_name,
      sortOrder: getDefaultSortOrder('province_name', sorter),
      ...getColumnSearchProps('province_name'),
      // render: (txt: any, row: any) => currentUser?.is_sysadmin ? <Link to={"/city/" + row.id} tabIndex={loadingProcess ? -1 : undefined}>{txt}</Link> : txt,
    },
    {  
      title: 'Country',
      dataIndex: 'country_name',
      key: 'country_name',
      width: 325,
      sorter: (a: any, b: any) => a.country_name - b.country_name,
      sortOrder: getDefaultSortOrder('country_name', sorter),
      ...getColumnSearchProps('country_name'),
    },
    {
      title: '',
      dataIndex: 'x',
      key: 'x',
      align: 'center',
      fixed: 'right',
      width: 75,
      render: (txt: any, { id, is_sysadmin, province_name, province_code, country_id }: any) => {
        return currentUser?.is_sysadmin && (
          <>
            <Button
              title="Edit"
              size="small"
              ghost
              type="primary"
              icon={<EditOutlined />}
              disabled={loadingProcess}
              onClick={() => toggleFormModal({ id, province_name, province_code, country_id })}
            />
            {' '}
            {!is_sysadmin && (
              <Button
                title="Delete"
                size="small"
                type="primary"
                ghost
                danger
                icon={<DeleteOutlined />}
                disabled={loadingProcess}
                onClick={() => clickDelete(id)}
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
            onClick={() => toggleFormModal({ province_name: '' })}
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
        // pagination={tableProps.pagination}
        loading={loadingTable}
        columns={columns}
        title={renderTitle}
      />

      <FormModal
        values={formValues}
        onCancel={toggleFormModal}
      />

      {modalContextHolder}
    </>
  );
}

export default function Page() {
  const TITLE_PAGE = "Province";
  
  useDocumentTitle(TITLE_PAGE + " • " + import.meta.env.VITE_APP_NAME);

  const { data: accessControl } = useCan({
    resource: "province",
    action: "list", // @ts-ignore
    params: { resource: { entity_name: "province" } }
  });

  if(!accessControl){
    return null;
  }

  return accessControl.can ? <Content title={TITLE_PAGE} /> : <Unauthorized />;
}
