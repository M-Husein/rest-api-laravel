import { useForm as useFormHook } from "@refinedev/react-hook-form";
import { useTranslate } from "@refinedev/core";

export const useForm = (props: any): any => {
  const t = useTranslate();

  const result = useFormHook({
    ...props,
    refineCoreProps: {
      queryOptions: { enabled: false },
      redirect: false,
      successNotification: (resData: any) => ({
        type: "success",
        message: resData.message,
        description: resData.description || t('notifications.success')
      }),
      ...props.refineCoreProps
    }
  });

  return result;
}
