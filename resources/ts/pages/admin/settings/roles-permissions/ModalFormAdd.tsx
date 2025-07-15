import { HttpError } from '@refinedev/core';
import { useForm } from "@refinedev/react-hook-form"; // useModalForm
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd';
import { Form } from '@/components/forms/Form';

interface IPost {
  role_name: string;
}

export const ModalFormAdd = ({
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
  } = useForm<IPost, HttpError, IPost>({
    values,
    refineCoreProps: {
      queryOptions: {
        enabled: false,
      },
      redirect: false,
      resource: "application-role/" + (hasId ? "update" : "create"),
      // action: hasId ? "edit" : "create",
      meta: {
        method: hasId ? "put" : "post",
      },
      onMutationSuccess(res, value){
        onCancel(null, value); // Close modal & reset values
      },
    },
  });

  const doCancel = () => {
    onCancel();
    reset();
  }

  const doSubmit = (newValues: any) => {
    if(hasId){
      if(values.role_name !== newValues.role_name){
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
      title={(hasId ? 'Edit' : 'Create') + " Role"}
      okText="Save"
      okButtonProps={{ 
        htmlType: "submit", 
        form: "formModal",
        loading: formLoading,
      }}
      cancelButtonProps={{ disabled: formLoading }}
      // footer={(x: any, { OkBtn }: any) => <OkBtn />}
      open={!!values}
      onCancel={doCancel}
      afterOpenChange={(open: boolean) => { // @ts-ignore
        open && document.getElementById('roleName')?.focus?.()
      }}
    >
      <Form
        id="formModal"
        className="mt-6"
        disabled={formLoading}
        onSubmit={handleSubmit(doSubmit)}
      >
        <label htmlFor="roleName">Role Name</label>
        <Controller
          name="role_name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="roleName"
              className="mt-1"
              disabled={formLoading}
              status={errors.role_name ? "error" : ""}
            />
          )}
          rules={{
            required: "is required",
            minLength: {
              value: 2,
              message: "Minimum length 2"
            },
            pattern: {
              value: /^\S(.*\S)?$/,
              message: "No leading and trailing whitespace"
            },
          }}
        />

        {errors.role_name && (
          <div className="mt-1 text-red-600 text-xs">
            {errors.role_name.message}
          </div>
        )}
      </Form>
    </Modal>
  );
}
