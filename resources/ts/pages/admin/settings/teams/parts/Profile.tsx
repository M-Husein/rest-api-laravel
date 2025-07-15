import { useState } from "react";
import { HttpError, useNotification } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Spin, Button, Input, Col, Row } from 'antd'; // , Checkbox
import isEqual from 'react-fast-compare';
import { Form } from '@/components/forms/Form';
import { ButtonReload } from '@/components/ButtonReload';

interface IPost {
  team_name: string;
  // application_report_id?: string;
}

export const Profile = ({
  refetch,
  loading,
  isLoading,
  isRefetching,
  disabled,
  values,
}: any) => {
  const { open: openNotif } = useNotification(); // , close: closeNotif
  const [initValue, setInitValue] = useState<any>();

  const {
    refineCore: { onFinish, formLoading },
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IPost, HttpError, IPost>({
    values,
    refineCoreProps: {
      queryOptions: {
        enabled: false,
      },
      redirect: false,
      action: "edit",
      resource: "team", // api/team/update
      id: "update",
      onMutationSuccess: (res, val) => setInitValue(val)
    },
  });

  const loadingAll = loading || formLoading;

  const doSubmit = (newValues: any) => {
    // Check initial / current value is equal with new value
    // !isEqual(initValue || values, newValues) && onFinish(newValues)
    if(isEqual(initValue || values, newValues)){
      // closeNotif?.("t");
      openNotif?.({
        key: "t",
        type: "success",
        message: "Successfully save",
      })
      return;
    }
    onFinish(newValues);
  }

  return (
    <Spin spinning={loading}>
      <Form
        fieldsetClass="py-6 px-4 lg_pl-6 lg_pr-10 space-y-6"
        disabled={disabled || loadingAll}
        onSubmit={handleSubmit(doSubmit)}
      >
        <h2 className="text-lg flex">
          Profile

          <ButtonReload
            className="ml-auto"
            disabled={loading}
            loading={!isLoading && isRefetching}
            onClick={() => refetch()}
          />
        </h2>
        
        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="teamName">Team Name</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="team_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  disabled={disabled || loadingAll}
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
          </Col>
        </Row>

        {/* <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="teamLeader">Team Leader</label>
          </Col>
          <Col lg={18} xs={24}>
            <div className="mb-6">
              <Controller
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    allowClear
                    disabled={isLoading}
                    id="teamLeader"
                    className="w-full"
                    status={errors.team_leader ? "error" : ""}
                    options={[
                      { value: 'Aziz', label: 'Aziz' },
                      { value: 'Eko', label: 'Eko' },
                    ]}
                  />
                )}
                name="team_leader"
                control={control}
                rules={{ required: "Team Leader is required" }}
              />
              {errors.team_leader && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.team_leader.message}
                </div>
              )}
            </div>

            <Checkbox disabled={loading}>Is Division</Checkbox>
          </Col>
        </Row> */}

        <div className="text-right">
          <Button
            type="primary"
            htmlType="submit"
            disabled={loading}
            loading={formLoading}
          >
            Save
          </Button>
        </div>
      </Form>
    </Spin>
  )
}
