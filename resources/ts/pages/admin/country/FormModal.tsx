import { useEffect } from 'react';
import { HttpError, useOne } from '@refinedev/core';
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd';
import { Form } from '@/components/forms/Form';
import { SelectLazy } from '@/components/forms/SelectLazy';

let cacheCurrency: any;

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
  currency_id: string,
  // currency_code: string,
  country_code: string,
  country_name: string,
}

export const FormModal = ({
  values,
  onCancel,
}: any) => {
  const hasId = values?.id;

  const {
    data: dataCurrency,
    isLoading: isLoadingCurrency,
    isFetching: isFetchingCurrency,
    isRefetching: isRefetchingCurrency,
  } = useOne<any, HttpError>({
    resource: "currency", // /api/currency/get-all
    id: "get-all",
    queryOptions: {
      enabled: !cacheCurrency && !!values,
    },
    successNotification(res){
      cacheCurrency = res?.data;
      return false;
    }
  });
  // console.log('dataCountry: ', dataCountry)

  let loadingCurrency = isLoadingCurrency || isFetchingCurrency || isRefetchingCurrency;

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
      resource: "country" + (hasId ? "" : "/create"),
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
        values.country_name !== newValues.country_name 
        || 
        values.country_code !== newValues.country_code
        || 
        values.currency_id !== newValues.currency_id
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
      title={(hasId ? 'Edit' : 'Create') + " Country"}
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
          <label htmlFor="cId">Currency</label>
          <Controller
            name="currency_id"
            control={control}
            render={({ field }) => (
              <SelectLazy
                {...field}
                value={loadingCurrency ? null : field.value}
                id="cId"
                className="mt-1 w-full"
                disabled={formLoading}
                status={errors.currency_id ? "error" : ""}
                loading={loadingCurrency}
                options={(dataCurrency?.data || []).map((item: any) => ({ id: item.id, text: item.currency_name }))}
              />
            )}
            rules={{ required: VALIDATIONS.required }}
          />

          {errors.currency_id && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.currency_id.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="cName">Country Name</label>
          <Controller
            name="country_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="cName"
                className="mt-1"
                disabled={formLoading}
                status={errors.country_name ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.country_name && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.country_name.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="cCode">Country Code</label>
          <Controller
            name="country_code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="cCode"
                className="mt-1"
                disabled={formLoading}
                status={errors.country_code ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />

          {errors.country_code && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.country_code.message}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
}
