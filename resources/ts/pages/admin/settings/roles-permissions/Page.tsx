import { useState } from 'react';
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useCan, useList, useDelete } from "@refinedev/core"; // , useParsed
import { Card, Button, Input, Col, Row, List, Skeleton, Tabs, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ButtonReload } from '@/components/ButtonReload';
import { RolesAccess } from './RolesAccess';
import { UserRoles } from './UserRoles';
import { TeamRoles } from './TeamRoles';
import { ModalFormAdd } from './ModalFormAdd';
import { Unauthorized } from '@/components/Unauthorized';
import { confirms } from '@/constants/texts';

const INIT_PAGING = { pageSize: 10, current: 1 };

const Content = ({ title }: { title: string }) => {
  // const { params: { current, pageSize, sorters, filters } } = useParsed<any>();
  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useDelete();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [searchValue, setSearchValue] = useState<string>('');
  const [pagination, setPagination] = useState<any>(INIT_PAGING);
  const [paginationTable, setPaginationTable] = useState(INIT_PAGING);
  const [tabActive, setTabActive] = useState<string>('1');
  const [roleActive, setRoleActive] = useState<any>({});
  const [roleValues, setRoleValues] = useState<any>();

  const {
    data: dataList, 
    isLoading: isLoadingList, 
    isFetching: isFetchingList, 
    isRefetching: isRefetchingList,
    isError: isErrorList,
    refetch: refetchList,
  } = useList<any, HttpError>({
    resource: "application-role/data-tables",
    meta: {
      method: "post",
      json: {
        draw: 0,
        start: 0,
        length: pagination.pageSize,
        page: pagination.current,
        columns: [
          {
            data: "role_name",
            name: "role_name",
          },
        ],
        search: { searchValue, searchRegex: true }
      },
    },
  });

  let loadingList = isLoadingList || isFetchingList || isRefetchingList;
  let disabledTabs = loadingList || isErrorList || !roleActive.id;

  const toggleModalFormRole = (val?: any, editValue?: any) => {
    setRoleValues(val);

    val === null && refetchList();

    if(editValue && roleActive.id){
      setRoleActive(editValue);
    }
  }

  const selectRoles = (item: any) => {
    setRoleActive(item);
    setPaginationTable({ ...paginationTable, current: 1 });
    setTabActive("1"); // Back to Roles Access Tab
  }

  const changePagination = (current: number, pageSize: number) => {
    setPagination({ current, pageSize });
    setTabActive("1"); // Back to Roles Access Tab
  }

  const clickDeleteRole = ({ id }: any) => {
    const confirmDelete = modalApi.confirm({
      keyboard: false,
      centered: true,
      closable: true,
      // okText: "Delete",
      okButtonProps: { danger: true },
      title: confirms.delete,
      footer: (x: any, { OkBtn }: any) => <OkBtn />,
      onOk(){
        const updateConfirm = (closable: boolean) => {
          confirmDelete.update({ closable })
        }

        updateConfirm(false);

        return new Promise((resolve, reject) => {
          mutateDelete({
            resource: "application-role/delete",
            id,
          }, {
            onError: (e) => {
              updateConfirm(true)
              reject(e)
            },
            onSuccess: (data: any) => {
              selectRoles({});
              refetchList();
              resolve(data);
            },
          });
        });
      },
    });
  }

  const refreshList = () => {
    refetchList();
    setTabActive("1"); // Back to Roles Access Tab
    setRoleActive({});
  }

  return (
    <>
      <h1 className="text-lg mb-4">{title}</h1>
      <Row gutter={[16, 24]}>
        <Col lg={6} xs={24} className="space-y-3">
          <div className="flex">
            <Button
              className="grow mr-2"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => toggleModalFormRole({ role_name: '' })}
            >
              Create Roles
            </Button>
            <ButtonReload
              disabled={loadingList || isLoadingDelete}
              loading={!isLoadingList && isRefetchingList}
              onClick={refreshList}
            />
          </div>
          <Input.Search
            role="search"
            allowClear
            disabled={loadingList || isLoadingDelete}
            placeholder="Search"
            onSearch={(val: any) => {
              setSearchValue(val)
              // Reset page
              pagination.current !== 1 && setPagination({ ...pagination, current: 1 })
            }}
          />
          <List
            className="bg-white"
            bordered
            size="small"
            rowKey={item => item.id || item}
            pagination={loadingList && isErrorList ? false : {
              total: dataList?.recordsFiltered,
              showSizeChanger: true,
              onChange: changePagination,
              onShowSizeChange: changePagination,
              position: "bottom", 
              align: "center", 
              size: "small",
              ...pagination,
            }}
            dataSource={loadingList ? [1, 2, 3] : dataList?.data}
            renderItem={(item: any) => (
              <List.Item className="gap-x-1 !p-0">
                <Skeleton
                  active
                  title={false}
                  paragraph={{ rows: 1, width: "100%" }}
                  loading={loadingList}
                  className="p-2"
                >
                  <Button
                    type={roleActive.id === item.id ? "primary" : "text"}
                    title={item.role_name}
                    className="justify-start grow my-1 ml-1 truncate"
                    onClick={() => selectRoles(item)}
                  >
                    <div className="truncate">{item.role_name}</div>
                  </Button>
                  <Button
                    ghost
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    title="Edit"
                    className="flex-none"
                    onClick={() => toggleModalFormRole(item)}
                  />
                  <Button
                    ghost
                    danger
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                    title="Delete"
                    className="flex-none mr-2"
                    onClick={() => clickDeleteRole(item)}
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </Col>

        <Col lg={18} xs={24}>
          <Card
            styles={{ body: { padding: 0 } }}
            className="shadow-sm"
          >
            <Tabs
              tabBarStyle={{ padding: '0 1rem' }}
              activeKey={tabActive}
              onChange={setTabActive}
              items={[
                {
                  key: "1",
                  label: "Roles Access",
                  disabled: disabledTabs,
                  children: (
                    <RolesAccess
                      id={roleActive.id}
                      name={roleActive.role_name}
                      pagination={paginationTable}
                      onChange={setPaginationTable}
                    />
                  ),
                },
                {
                  key: "2",
                  label: "User Roles",
                  disabled: disabledTabs,
                  children: <UserRoles id={roleActive.id} disabled={isErrorList} />,
                },
                {
                  key: "3",
                  label: "Team Roles",
                  disabled: disabledTabs,
                  children: <TeamRoles id={roleActive.id} disabled={isErrorList} />,
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <ModalFormAdd
        values={roleValues}
        onCancel={toggleModalFormRole}
      />

      {modalContextHolder}
    </>
  );
}

export default function Page() {
  const TITLE_PAGE = "Roles & Permissions";

  useDocumentTitle(TITLE_PAGE + " - " + import.meta.env.VITE_APP_NAME);

  const { data: accessControl } = useCan({
    resource: "role_access",
    action: "list", // @ts-ignore
    params: { resource: { entity_name: "role_access" } }
  });

  if(!accessControl){
    return null;
  }

  return accessControl.can ? <Content title={TITLE_PAGE} /> : <Unauthorized />;
}
