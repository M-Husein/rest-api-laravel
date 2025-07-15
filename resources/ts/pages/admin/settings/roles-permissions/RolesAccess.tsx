import { useState } from "react";
import { useUpdate } from "@refinedev/core";
import { useTable } from "@refinedev/antd"; // , getDefaultSortOrder
import { Alert, Row, Col, Dropdown, Button, Result } from 'antd';
// import type { TableColumnsType } from 'antd'; // TableProps
import { FaEllipsisVertical } from "react-icons/fa6";
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { ButtonReload } from '@/components/ButtonReload';
import { ROLE_TYPES, ROLE_KEYS } from "./conts";

export const RolesAccess = ({
  id,
  name,
  pagination,
  onChange,
}: any) => {
  const [searchValue, setSearchValue] = useState<string>('');
  
  const {
    tableProps,
    // sorter,
    tableQuery: { 
      // data: tableData, 
      isLoading, 
      isFetching, 
      isRefetching, 
      refetch, 
    },
  } = useTable({
    queryOptions: {
      enabled: !!id,
    },
    resource: "role-access/data-tables/" + id,
    // pagination: { mode: "off" },
    meta: {
      method: "post",
      json: {
        draw: 0,
        start: 0,
        length: pagination.pageSize,
        page: pagination.current,
        columns: ["display_name", ...ROLE_KEYS].map(name => ({ name, data: name })),
        orders: [
          {
            columnName: "display_name",
            direction: "asc"
          }
        ],
        search: { searchValue, searchRegex: true }
      },
    },
  });

  let loadingTable = isLoading || isFetching || isRefetching;

  const parseInitValueSetAll = (row: any) => {
    const { access_create, access_read, access_update, access_delete, access_menu } = row;
    const values = [access_create, access_read, access_update, access_delete, access_menu];
    let valuesLength = values.length;
    let val = '';
    for (let i = 0; i < valuesLength; i++) {
      let valItem = values[i];
      if(values.every((item) => item === valItem)){
        val = '' + valItem;
        break;
      }
    }
    return val;
  }

  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useUpdate();

  const changeRoleAccess = (id: string, field: string, value: number | string) => {
    mutateUpdate({
      resource: "role-access", // /api/role-access/update
      id: "update",
      values: { id, field, value, cycle: false },
    }, {
      onSuccess: () => refetch(),
    });
  }

  const formatterComponent = (value: any, data: any, columnName?: any) => {
    let valueStr = '' + value;
    let isSetAll = columnName === 'setAll';
    
    return (
      <Dropdown
        placement="top"
        arrow={{ pointAtCenter: true }}
        trigger={['click', 'hover']}
        disabled={loadingTable}
        menu={{ // @ts-ignore
          items: ROLE_TYPES.toReversed().map((item: any) => ({ ...item, icon: <i className={"pie pie-" + item.c} /> }) ),
          selectable: true,
          selectedKeys: [isSetAll ? parseInitValueSetAll(data) : valueStr], // defaultSelectedKeys
          onSelect: (val: any) => {
            changeRoleAccess(data.id, isSetAll ? 'access_all' : columnName, +val.key);
          }
        }}
      >
        {isSetAll ? 
          <Button size="small" icon={<FaEllipsisVertical className="align--2px" />} />
          :
          <button
            type="button"
            className={"bg-transparent align-middle !p-0 cursor-pointer pie pie-" + (ROLE_TYPES.find(f => f.key === valueStr)?.c)}
          />
        }
      </Dropdown>
    );
  }

  const columns: any = [
    { key: 'display_name', dataIndex: 'display_name', title: 'Entity', width: 215 },
    // { name: 'access_append', title: 'Approve' }, // , width: 80, align: "center", groupingEnabled: false
    { 
      key: 'access_create', dataIndex: 'access_create', title: 'Create', width: 65, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'access_create'),
    },
    { 
      key: 'access_read', dataIndex: 'access_read', title: 'Read', width: 65, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'access_read'),
    },
    { 
      key: 'access_update', dataIndex: 'access_update', title: 'Update', width: 65, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'access_update'),
    },
    { 
      key: 'access_delete', dataIndex: 'access_delete', title: 'Delete', width: 65, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'access_delete'),
    },
    { 
      key: 'access_menu', dataIndex: 'access_menu', title: 'Menu', width: 65, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'access_menu'),
    },
    { 
      key: 'setAll', dataIndex: 'setAll', title: 'Set All', width: 95, align: "center",
      render: (txt: any, row: any) => formatterComponent(txt, row, 'setAll'),
    },
  ];

  if(id){
    const renderTitle = () => (
      <Header
        title={name}
        content={
          <ButtonReload
            disabled={loadingTable || isLoadingUpdate}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />
        }
        placeholder="Search By Entity"
        onSearch={(val: any) => {
          pagination.current !== 1 && onChange({ ...pagination, current: 1 })
          setSearchValue(() => val)
        }}
      />
    );

    return (
      <>
        <Alert
          showIcon
          className="antAlert-left inline-flex mb-4 mx-4"
          message={<h3 className="-mt-1">Information</h3>}
          description={
            <Row className="gap-y-2">
              {ROLE_TYPES.map((item) =>
                <Col key={item.key} lg={8} xs={12}>
                  <div className={"items-center gap-x-2 pie pie-" + item.c}>
                    {item.label}
                  </div>
                </Col>
              )}
            </Row>
          }
        />

        <Table
          {...tableProps}
          className="antTable max-md_antTable-xs border-t"
          scroll={{ x: 915 }}
          pagination={{
            ...tableProps.pagination,
            ...pagination
          }}
          onChange={onChange}
          loading={loadingTable || isLoadingUpdate}
          columns={columns}
          title={renderTitle}
        />
      </>
    );
  }

  return <Result title="Please Select role" />;
}
