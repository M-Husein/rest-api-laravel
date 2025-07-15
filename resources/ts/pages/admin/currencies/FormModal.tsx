import { useEffect } from 'react';
import { HttpError } from '@refinedev/core';
import { useModalForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd';
import { Form } from '@/components/forms/Form';

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
  currency_code: string,
  currency_name: string,
}

export const FormModal = ({
  values,
  onCancel,
}: any) => {
  const hasId = values?.id;

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
      resource: "currency" + (hasId ? "" : "/create"),
      action: hasId ? "edit" : "create",
      id: hasId ? "update" : undefined,
      // meta: {
      //   method: hasId ? "put" : "post",
      // },
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
        values.currency_name !== newValues.currency_name 
        || 
        values.currency_code !== newValues.currency_code
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
      title={(hasId ? 'Edit' : 'Create') + " Currency"}
      okText="Save"
      okButtonProps={{ 
        htmlType: "submit", 
        form: "formModal"
      }}
      cancelButtonProps={{ disabled: formLoading }} // htmlType: "reset", form: "formAddRole", 
      // footer={(x: any, { OkBtn }: any) => <OkBtn />}
      open={!!values}
      onCancel={doCancel}
      afterOpenChange={(open: boolean) => { // @ts-ignore
        open && document.getElementById('cn')?.focus?.()
      }}
    >
      <Form
        id="formModal"
        className="mt-6"
        disabled={formLoading}
        onSubmit={handleSubmit(doSubmit)}
      >
        <label htmlFor="cn">Name</label>
        <Controller
          name="currency_name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="cn"
              className="mt-1"
              disabled={formLoading}
              status={errors.currency_name ? "error" : ""}
            />
          )}
          rules={VALIDATIONS}
        />

        {errors.currency_name && (
          <div className="mt-1 text-red-600 text-xs">
            {errors.currency_name.message}
          </div>
        )}

        <label htmlFor="ccode" className="mt-4">Code</label>
        <Controller
          name="currency_code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="ccode"
              className="mt-1"
              disabled={formLoading}
              status={errors.currency_code ? "error" : ""}
            />
          )}
          rules={VALIDATIONS}
        />

        {errors.currency_code && (
          <div className="mt-1 text-red-600 text-xs">
            {errors.currency_code.message}
          </div>
        )}
      </Form>
    </Modal>
  );
}
