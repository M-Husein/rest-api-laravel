import { useEffect } from 'react';
import { HttpError, useOne } from '@refinedev/core';
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd';
import { Form } from '@/components/forms/Form';
import { SelectLazy } from '@/components/forms/SelectLazy';

let cacheProvince: any;

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
  province_id: string,
  city_name: string,
  city_code: string,
}

export const FormModal = ({
  values,
  onCancel,
}: any) => {
  const hasId = values?.id;

  const {
    data: dataProvince,
    isLoading: isLoadingProvince,
    isFetching: isFetchingProvince,
    isRefetching: isRefetchingProvince,
  } = useOne<any, HttpError>({
    resource: "province", // /api/province/get-all
    id: "get-all",
    queryOptions: {
      enabled: !cacheProvince && !!values,
    },
    successNotification(res){
      cacheProvince = res?.data;
      return false;
    }
  });
  // console.log('dataProvince: ', dataProvince)

  let loadingProvince = isLoadingProvince || isFetchingProvince || isRefetchingProvince;

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
      resource: "city" + (hasId ? "" : "/create"),
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
        values.city_name !== newValues.city_name 
        || 
        values.city_code !== newValues.city_code
        || 
        values.province_id !== newValues.province_id
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
      title={(hasId ? 'Edit' : 'Create') + " City"}
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
          <label htmlFor="provId">Province</label>
          <Controller
            name="province_id"
            control={control}
            render={({ field }) => (
              <SelectLazy
                {...field}
                value={loadingProvince ? null : field.value}
                id="provId"
                className="mt-1 w-full"
                disabled={formLoading}
                status={errors.province_id ? "error" : ""}
                loading={loadingProvince}
                options={(dataProvince?.data || []).map((item: any) => ({ id: item.id, text: item.province_name }))}
              />
            )}
            rules={{ required: VALIDATIONS.required }}
          />

          {errors.province_id && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.province_id.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="ctName">City Name</label>
          <Controller
            name="city_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="ctName"
                className="mt-1"
                disabled={formLoading}
                status={errors.city_name ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.city_name && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.city_name.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="ctCode">City Code</label>
          <Controller
            name="city_code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="ctCode"
                className="mt-1"
                disabled={formLoading}
                status={errors.city_code ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.city_code && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.city_code.message}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
