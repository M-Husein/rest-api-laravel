import { useState } from "react";
import { HttpError, useList } from "@refinedev/core"; // useCreate, useTranslate, 
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Button, Input, Modal } from 'antd';
import Bowser from "bowser";
import { Table } from '@/components/table/Table';
import { Header } from '@/components/table/Header';
import { ButtonReload } from '@/components/ButtonReload';
import { Form } from '@/components/forms/Form';

interface IFormValues {
  password: string,
}

export const LoggedInDevice = ({
  t,
  user,
  onClickSetPassword,
}: any) => {
  // const translate = useTranslate();
  // const { mutate: mutateCreate, isPending: isPendingCreate } = useCreate();
  const [selectedRow, setSelectedRow] = useState<any>();

  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    refetch,
  } = useList({
    resource: "devices", // active-devices
    pagination: { mode: "off" },
    // meta: {
    //   prefixUrl: window.location.origin + '/v1'
    // },
  });

  let loadingActiveDevices = isLoading || isFetching || isRefetching;
  // console.log('data: ', data);

  // const {
  //   data: dataSessions,
  //   // isLoading: isLoadingSessions,
  //   // isFetching: isFetchingSessions,
  //   // isRefetching: isRefetchingSessions,
  //   // refetch: refetchSessions,
  // } = useOne({
  //   resource: "test",
  //   id: "test-remember", // active-sessions
  //   // meta: {
  //   //   prefixUrl: window.location.origin
  //   // }
  // });
  // console.log('test-remember: ', dataSessions);

  const {
    formState: { errors },
    refineCore: { onFinish, formLoading },
    modal: { visible, show, close },
    control,
    reset,
    clearErrors,
    handleSubmit,
  } = useModalForm<IFormValues, HttpError, IFormValues>({
    // values: dataForm,
    refineCoreProps: {
      queryOptions: { enabled: false },
      redirect: false,
      // resource: selectedRow ? "logout-device/" + selectedRow : "logout-all-other", // "logout-others",
      // devices/{type}/{id}
      resource: selectedRow ? `devices/${selectedRow.type}/${selectedRow.id}` : "logout-all-other",
      meta: {
        // prefixUrl: window.location.origin + '/v1',
        method: selectedRow ? "DELETE" : "POST", // PUT
      },
      onMutationSuccess(){
        onSuccess()
      },
      successNotification: (resData: any) => resData.message ? ({
        type: "success",
        message: resData.message,
        description: resData.description || t('notifications.success')
      }) : void 0,
    },
  });

  const doCancel = () => {
    close();
    reset({});
    clearErrors();
    setSelectedRow(null);
  }

  const onSuccess = () => {
    doCancel();
    refetch();
  }

  const doSubmit = async (newValues: any) => {
    await onFinish(newValues);

    // Options
    // mutateCreate({
    //   resource: "logout-others-spa",
    //   values: newValues,
    //   meta: {
    //     prefixUrl: window.location.origin + '/v1'
    //   },
    //   successNotification: () => false,
    // });
  }

  const clickSetPassword = () => {
    close();
    onClickSetPassword();
  }

  const renderTitle = () => (
    <Header
      title="Logged in device" // {title}
      content={
        <>
          {!!data?.length && (
            <Button
              danger
              type="primary"
              disabled={formLoading}
              onClick={() => show("")}
            >
              Logout other devices
              {/* log out everywhere else */}
            </Button>
          )}

          <ButtonReload
            disabled={formLoading}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />
        </>
      }
      // onSearch={(val: any) => {
      //   current > 1 && setCurrent(1);
      //   setSearchValue(() => val)
      // }}
    />
  );

  const renderDeviceInfo = (getBy: 'getOS' | 'getBrowser') => (val: any, row: any) => {
    const info: any = Bowser.getParser(row.user_agent)[getBy]();
    return (
      <div className="flex items-center">
        <img 
          src={`/media/img/${getBy === 'getOS' ? 'os' : 'browsers'}/${info.name.toLowerCase().replace(' ', '-')}.svg`} 
          alt={info.name}
          loading="lazy"
          decoding="async"
          width={35}
          height={35}
        />
        <div className="text-xs ml-2">
          <b>{info.name}</b>
          <br />
          Version {info.version}
          {/* <br />
          {info.versionName} */}
        </div>
      </div>
    )
  }

  const columns: any = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 65,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 95,
    },
    {
      title: 'Platform',
      dataIndex: 'user_agent',
      key: 'user_agent',
      width: 115,
      className: "capitalize",
      render: (val: any) => Bowser.getParser(val).getPlatformType(),
    },
    {
      title: 'OS',
      dataIndex: 'os',
      key: 'os',
      width: 115,
      render: renderDeviceInfo('getOS'),
    },
    {
      title: 'Browser',
      dataIndex: 'browser',
      key: 'browser',
      width: 115,
      render: renderDeviceInfo('getBrowser'),
    },
    {
      title: 'Ip address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 75,
    },
    {
      title: 'Expires',
      dataIndex: 'expires_at',
      key: 'expires_at',
      width: 75,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 75,
    },
    {
      title: 'Last activity',
      dataIndex: 'last_activity', // last_used_at
      key: 'last_used_at', // last_used_at
      width: 135,
    },
    {
      title: '',
      dataIndex: 'x',
      key: 'x',
      align: 'center',
      fixed: 'right',
      width: 55,
      render: (txt: any, row: any) => (
        <Button
          danger
          size="small"
          icon={<>❌</>}
          title="Logout"
          // loading={selectedRow === row.id && formLoading}
          disabled={loadingActiveDevices || formLoading}
          onClick={() => {
            setSelectedRow(row);
            show("");
          }}
        />
      )
    },
  ];

  return (
    <>
      <Table
        className="antTable max-md_antTable-xs"
        scroll={{ x: 975, y: 750 }}
        loading={loadingActiveDevices}
        columns={columns} // @ts-ignore
        dataSource={data || []}
        title={renderTitle}
      />

      <Modal
        centered
        open={visible}
        keyboard={false}
        maskClosable={false}
        closeIcon={null}
        // title={t(`buttons.${hasId ? 'edit' : 'create'}`) + " Translation" + (values?.is_custom || !hasId ? "" : " (Default)")}
        title="Logout device"
        okText={user?.has_password ? void 0 : "Request set password"} // t('buttons.save')
        okButtonProps={{ 
          htmlType: user?.has_password ? "submit" : void 0, 
          form: "formModal",
          loading: formLoading, // || isPendingCreate
          onClick: user?.has_password ? void 0 : clickSetPassword
        }}
        cancelButtonProps={{ disabled: formLoading }} //  || isPendingCreate
        onCancel={doCancel}
        afterOpenChange={(isOpen: boolean) => isOpen && user?.has_password && document.getElementById('pwd')?.focus()}
      >
        {user?.has_password ? 
          <Form
            id="formModal"
            className="mt-6"
            disabled={formLoading} //  || isPendingCreate
            onSubmit={handleSubmit(doSubmit)} // onFinish
          >
            <label htmlFor="pwd">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="pwd"
                  className="mt-1"
                  disabled={formLoading}
                  readOnly={formLoading}
                  autoComplete="current-password" //  | off
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  size="large"
                  status={errors.password ? "error" : ""}
                />
              )}
              rules={{
                required: t('error.required'),
                minLength: {
                  value: 2,
                  message: t('error.minLength', { v: 6 })
                }
              }}
            />
            {errors.password && (
              <div className="mt-1 text-red-600 text-xs">
                {errors.password.message}
              </div>
            )}
          </Form>
          :
          <h2 className="text-xl">Please request set password</h2>
        }
      </Modal>
    </>
  );
}

// const renderUserAgent = (val: string) => {
//   if(val){
//     const parseItem = (key: string, value: any) => {
//       switch(key){
//         case "browser":
//           return (
//             <div className="flex items-center">
//               <img 
//                 src={`/media/img/browsers/${value.name.toLowerCase().replace(' ', '-')}.svg`} 
//                 alt={value.name}
//                 loading="lazy"
//                 decoding="async"
//                 // width={45}
//                 height={35}
//               />
//               <div className="text-xs ml-2">
//                 <b>{value.name}</b>
//                 <br />
//                 Version {value.version}
//               </div>
//             </div>
//           );
//         case "os":
//           return (
//             <div className="text-xs ml-2">
//               <b>{value.name}</b> {value.versionName}
//               <br />
//               Version {value.version}
//             </div>
//           );
//         default:
//           return;
//       }
//     }

//     return Object.entries(Bowser.parse(val)).map(([key, value]: any, index: number) => (
//       <Card
//         key={key}
//         title={key}
//         type="inner"
//         size="small"
//         className={"shadow" + (index ? " mt-2" : "")}
//       >
//         {parseItem(key, value)}
//       </Card>
//     ))
//   }
// }
