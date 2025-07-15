import { useEffect } from 'react';
import { HttpError, useOne } from '@refinedev/core';
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd';
import { Form } from '@/components/forms/Form';
import { SelectLazy } from '@/components/forms/SelectLazy';

let cacheCountry: any;

const VALIDATIONS: any = {
  required: "is required",
  minLength: {
    value: 2,
    message: "Minimum length 2"
  },
  pattern: {
    value: /^\S(.*\S)?$/,
    message: "No leading and trailing whitespace"
  },
};

interface IPost {
  id?: string,
  country_id: string,
  province_name: string,
  province_code: string,
}

export const FormModal = ({
  values,
  onCancel,
}: any) => {
  const hasId = values?.id;

  const {
    data: dataCountry,
    isLoading: isLoadingCountry,
    isFetching: isFetchingCountry,
    isRefetching: isRefetchingCountry,
  } = useOne<any, HttpError>({
    resource: "country", // /api/province/get-all
    id: "get-all",
    queryOptions: {
      enabled: !cacheCountry && !!values,
    },
    successNotification(res){
      cacheCountry = res?.data;
      return false;
    }
  });
  // console.log('dataCountry: ', dataCountry)

  let loadingCountry = isLoadingCountry || isFetchingCountry || isRefetchingCountry;

  const {
    formState: { errors },
    refineCore: { onFinish, formLoading },
    control,
    reset,
    handleSubmit,
  } = useModalForm<IPost, HttpError, IPost>({
    values,
    refineCoreProps: {
      queryOptions: {
        enabled: false,
      },
      redirect: false,
      resource: "province" + (hasId ? "" : "/create"),
      action: hasId ? "edit" : "create",
      id: hasId ? "update" : undefined,
      onMutationSuccess(){
        onCancel(null);
      },
    },
  });

  useEffect(() => {
    if(values) reset(values);
  }, [values]);

  const doCancel = () => {
    onCancel();
    reset();
  }

  const doSubmit = (newValues: any) => {
    if(hasId){
      if(
        values.province_name !== newValues.province_name 
        || 
        values.province_code !== newValues.province_code
        || 
        values.country_id !== newValues.country_id
      ){
        onFinish(newValues)
      }else{
        doCancel();
      }
    }else{
      onFinish(newValues)
    }
  }

  return (
    <Modal
      width={450}
      keyboard={false}
      maskClosable={false}
      closeIcon={!formLoading}
      title={(hasId ? 'Edit' : 'Create') + " Province"}
      okText="Save"
      okButtonProps={{ 
        htmlType: "submit", 
        form: "formModal"
      }}
      cancelButtonProps={{ disabled: formLoading }}
      // footer={(x: any, { OkBtn }: any) => <OkBtn />}
      open={!!values}
      onCancel={doCancel}
    >
      <Form
        id="formModal"
        className="mt-6"
        fieldsetClass="space-y-4"
        disabled={formLoading}
        onSubmit={handleSubmit(doSubmit)}
      >
        <div>
          <label htmlFor="cId">Country</label>
          <Controller
            name="country_id"
            control={control}
            render={({ field }) => (
              <SelectLazy
                {...field}
                value={loadingCountry ? null : field.value}
                id="cId"
                className="mt-1 w-full"
                disabled={formLoading}
                status={errors.country_id ? "error" : ""}
                loading={loadingCountry}
                options={(dataCountry?.data || []).map((item: any) => ({ id: item.id, text: item.country_name }))}
              />
            )}
            rules={{ required: VALIDATIONS.required }}
          />

          {errors.country_id && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.country_id.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pName">Province Name</label>
          <Controller
            name="province_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="pName"
                className="mt-1"
                disabled={formLoading}
                status={errors.province_name ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.province_name && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.province_name.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pCode">Province Code</label>
          <Controller
            name="province_code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="pCode"
                className="mt-1"
                disabled={formLoading}
                status={errors.province_code ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.province_code && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.province_code.message}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
