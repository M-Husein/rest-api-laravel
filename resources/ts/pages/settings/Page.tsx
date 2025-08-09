import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { Authenticated, HttpError, useGetIdentity, useTranslate, useCreate } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router-v6";
import { useForm } from "@refinedev/react-hook-form";
import { Card, Grid, Tabs, Modal } from 'antd';
import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
import * as z from "zod";
// import { Info } from '@/components/Info';
import { General } from './parts/General';
import { LoggedInDevice } from './parts/LoggedInDevice';
import { PasswordManagement } from './parts/PasswordManagement';

const title = "Settings";

export default function Page(){
  useDocumentTitle(title + " - " + APP.name);

  const { data: currentUser, isLoading: isLoadingCurrentUser }: any = useGetIdentity();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const breakpoint = Grid.useBreakpoint();
  const isSmallDevice = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const translate = useTranslate();
  const { mutate: mutateCreate, isPending: isPendinfCreate } = useCreate();
  // const passwordValidation = z.string(translate("error.required")).min(6, translate("error.minLength", { v: 6 }));
  const passwordValidation = z.string().min(6);

  const [tabActive, setTabActive] = useState("1"); // 0

  const {
    formState: { errors },
    refineCore: { onFinish, formLoading },
    control,
    reset,
    clearErrors,
    handleSubmit,
  } = useForm<any, HttpError, any>({
    resolver: zodResolver(
      z.object({
        current_password: passwordValidation,
        password: passwordValidation,
        password_confirmation: passwordValidation,
      })
      .refine(
        (data) => data.password === data.password_confirmation,
        {
          message: "Passwords don't match",
          path: ["password_confirmation"],
        }
      )
      .refine(
        (data) => data.current_password !== data.password,
        {
          // translate("error.passwordMustBeDifferent"),
          message: 'The new password must be different from the current password',
          path: ["password"],
        }
      )
    ),
    refineCoreProps: {
      queryOptions: { enabled: false },
      redirect: false,
      resource: "profile", // profile/change-password
      id: "change-password",
      action: "edit",
      onMutationSuccess(){
        resetForm()
      },
      successNotification: (resData: any) => resData.message ? ({
        type: "success",
        message: resData.message,
        description: resData.description || translate('notifications.success')
      }) : void 0,
    },
  });

  const doSubmit = (newValues: any) => {
    modalApi.confirm({
      keyboard: false,
      title: "Are you sure to change password?",
      content: "Login on other devices will be logged out automatically",
      onOk: async () => await onFinish(newValues)
    });
  }

  const resetForm = () => {
    reset({});
    clearErrors();
  }

  const requestSetPassword = () => {
    const confirms = modalApi.confirm({
      centered: true,
      keyboard: false,
      // closeIcon: null,
      cancelButtonProps: { disabled: false },
      title: "Are you sure to request set password?",
      // content: "Login on other devices will be logged out automatically",
      onOk: () => new Promise((resolve, reject) => {
        const updateConfirms = (disabled: boolean) => {
          confirms.update({ cancelButtonProps: { disabled } })
        }

        updateConfirms(true);

        mutateCreate({
          resource: "password/request-set-link",
          values: {},
          successNotification: (res: any) => ({
            type: "success",
            message: res?.message
          })
        }, {
          onSuccess: (res) => {
            resolve(res)
          },
          onError: (e) => {
            updateConfirms(false);
            reject(e);
          },
        });
      })
    });
  }

  return (
    <Authenticated
      key="authenticated-inner"
      fallback={<CatchAllNavigate to={import.meta.env.VITE_LOGIN_PATH} />}
    >
      <div className="xl_max-w-screen-xl mx-auto p-2">
        <Card 
          title={title}
          className="shadow"
          styles={{ body: { padding: 0 } }}
        >
          <Tabs
            tabPosition={isSmallDevice ? "top" : "left"}
            tabBarStyle={
              isSmallDevice ? {
                paddingLeft: 16,
                marginBottom: 0
              } : {
                padding: '1rem 0',
                minWidth: 200
              }
            }
            className="tab-full"
            activeKey={tabActive}
            onChange={(tab) => {
              setTabActive(tab);
              // setSearchParams(prev => ({ ...prev, tab }));
            }}
            items={[
              // {
              //   key: "0",
              //   label: <><b className="mr-4">ℹ️</b>Information</>,
              //   className: "h-full",
              //   disabled: formLoading,
              //   children: (
              //     <Info className="h-full py-2">
              //       <h2>Information</h2>
              //     </Info>
              //   )
              // },
              {
                key: "1",
                label: <><b className="mr-4">🔑</b>Change Password</>,
                disabled: formLoading,
                children: (
                  <div className="py-4 md_pr-4">
                    <PasswordManagement 
                      t={translate}
                      user={currentUser}
                      control={control}
                      errors={errors}
                      loading={formLoading || isPendinfCreate || isLoadingCurrentUser}
                      onSubmit={handleSubmit(doSubmit)}
                      onClick={requestSetPassword}
                    />
                  </div>
                ),
              },
              {
                key: "2",
                label: <><b className="mr-4">💻</b>Logged in device</>,
                disabled: formLoading,
                children: (
                  <div className="py-4 md_pr-4">
                    <LoggedInDevice 
                      t={translate}
                      user={currentUser}
                      onClickSetPassword={requestSetPassword} // () => setTabActive('1')
                    />
                  </div>
                )
              },
              {
                key: "3",
                label: "General",
                disabled: formLoading,
                children: (
                  <div className="py-4 md_pr-4">
                    <General />
                  </div>
                )
              }
            ]}
          />
        </Card>

        {modalContextHolder}
      </div>
    </Authenticated>
  );
}
