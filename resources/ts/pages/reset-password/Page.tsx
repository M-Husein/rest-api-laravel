import { useEffect } from "react";
import { Input, Button } from "antd"; // Card, Typography, Layout, theme
import { HttpError, useParsed, useTranslate, useNotification, useNavigation } from "@refinedev/core";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import { zodResolver } from "@hookform/resolvers/zod";
// import * as yup from 'yup';
import { z } from "zod";
// import { useSearchParams } from 'react-router-dom'; // Link, Navigate
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';

interface IPost {
  email: string;
  token: string;
  password: string;
  password_confirmation?: string;
}

const TITLE_PAGE = "Reset Password";

const ResetPassword: React.FC<any> = () => {
  useDocumentTitle(TITLE_PAGE + " • " + import.meta.env.VITE_APP_NAME);

  // const { token } = theme.useToken();
  const translate = useTranslate();
  const { params: { token: accessToken, email } } = useParsed<any>();
  const { open: openNotif } = useNotification();
  const { replace } = useNavigation();
  // const [searchParams] = useSearchParams(); // , setSearchParams
  // const accessToken = searchParams.get('token');
  // const email = searchParams.get("email");
  // const [ok, setOk] = useState<string>('');

  const stringRequired = z.string(translate("error.required"));

  const {
    refineCore: { onFinish, formLoading },
    // reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IPost, HttpError, IPost>({ // @ts-ignore
    // resolver: yupResolver(
    //   yup.object({
    //     email: yup.string().required().email(),
    //     token: yup.string().required(),
    //     password: yup.string().required(), // "Password is required"
    //     password_confirmation: yup.string()
    //       .required() // "Confirm Password is required"
    //       .oneOf([yup.ref('password')], 'Passwords must match'),
    //   })
    // ),
    resolver: zodResolver(
      z.object({
        email: z.email(translate("error.invalid")),
        token: stringRequired.refine((val) => val === val.trim(), {
          message: translate("error.trim"),
        }),
        password: stringRequired.min(6, translate("error.minLength", { v: 6 })),
        password_confirmation: stringRequired, // .min(6)
      })
      .refine(
        (data) => data.password === data.password_confirmation,
        {
          message: "Passwords don't match",
          path: ["password_confirmation"],
        }
      )
    ),
    defaultValues: { 
      email, 
      token: accessToken
    },
    refineCoreProps: {
      redirect: false,
      resource: "reset-password",
      onMutationSuccess: (res: any) => {
        // console.log('res: ', res);
        if(res?.data){
          replace(import.meta.env.VITE_LOGIN_PATH);
        }
      },
    },
  });

  // // Set initial form email value from URL param
  // useEffect(() => {
  //   if(email){
  //     reset({ email }); // , token: accessToken
  //   }
  // }, [email]); // , accessToken

  // // Redirect if token or email are missing from the URL (invalid link)
  useEffect(() => {
    if(!accessToken || !email){
      openNotif?.({
        type: "error",
        message: "Invalid or missing password reset link.",
        description: "Please request a new password reset link.",
      });
      // Redirect to forgot password page if link is invalid/incomplete
      replace("/auth/forgot-password");
    }
  }, [accessToken, email, replace, openNotif]);

  if(accessToken && email){
    const passwordProps: any = {
      size: "large",
      className: "mt-1",
      disabled: formLoading,
      spellCheck: false,
      autoComplete: "off", // new-password
      autoCorrect: "off",
      autoCapitalize: "off",
    };

    return (
      <Layout
        title={TITLE_PAGE}
        form={
          <Form
            fieldsetClass="space-y-6"
            disabled={formLoading}
            onSubmit={handleSubmit(onFinish)}
          >
            <div>
              <label htmlFor="email">Email</label>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    size="large"
                    className="mt-1"
                    readOnly
                    disabled={formLoading}
                    status={errors.email ? "error" : ""}
                  />
                )}
              />
              {errors.email && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.email.message}
                </div>
              )}
            </div>

            <div>
              {/* <label htmlFor="token">Token</label> */}
              <Controller
                control={control}
                name="token"
                render={({ field }) => (
                  <input
                    {...field}
                    type="hidden"
                    // id="token"
                    // size="large"
                    // className="mt-1"
                    // readOnly
                    disabled // ={formLoading}
                    // status={errors.token ? "error" : ""}
                  />
                )}
              />
              {errors.token && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.token.message}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="nPwd">New Password</label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    {...passwordProps}
                    id="nPwd"
                    status={errors.password ? "error" : ""}
                  />
                )}
              />
              {errors.password && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="pb-4">
              <label htmlFor="cPwd">Confirm Password</label>
              <Controller
                control={control}
                name="password_confirmation"
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    {...passwordProps}
                    id="cPwd"
                    status={errors.password_confirmation ? "error" : ""}
                  />
                )}
              />
              {errors.password_confirmation && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.password_confirmation.message}
                </div>
              )}
            </div>

            <Button
              block
              size="large"
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              Reset
            </Button>
          </Form>
        }
      />
    );
  }

  return null;
};

export default ResetPassword;
