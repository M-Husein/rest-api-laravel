// import { useState } from "react";
import { HttpError, useTranslate, useActiveAuthProvider, useRegister } from "@refinedev/core"; // , RegisterFormTypes
import { Input, Button } from "antd"; // , Radio
import { Link } from "react-router-dom";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form'; // useForm, 
// import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
// import { FaRegUser } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { socialsProvider } from '@/providers/socialsProvider';
// import { email as emailRegExp } from '@/utils/regExp';

type IFormValues = {
  name: string;
  email: string;
  // username: string;
  password: string;
  password_confirmation: string;
  providerName?: string; // providerName | provider
}

export default function Page(){
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  // <RegisterFormTypes>
  const { mutate: register, isPending } = useRegister<any>({ // isLoading
    v3LegacyAuthProviderCompatible: !!authProvider?.isLegacy 
  });

  const stringRequired = z.string(translate("error.required"));

  const {
    formState: { errors },
    control,
    handleSubmit, 
    // watch,
  } = useForm<IFormValues, HttpError, IFormValues>({
    resolver: zodResolver(
      z.object({
        name: stringRequired.refine((val) => val === val.trim(), {
          message: translate("error.trim"),
        }),
        email: z.email(translate("error.invalid")),
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
  });

  // const password = watch('password');

  const doRegister = (values: any) => {
    // console.log('values: ', values);
    register({ ...values, type: "spa" });
  }

  return (
    <Layout
      title="Register"
      form={
        <Form
          disabled={isPending}
          onSubmit={handleSubmit(doRegister)}
          fieldsetClass="space-y-6"
        >
          <div>
            <label htmlFor="uname">Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  id="uname"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.name ? "error" : ""}
                  autoComplete="name"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              )}
              // rules={{ 
              //   required: true,
              //   minLength: {
              //     value: 2,
              //     message: translate("error.minLength", { v: 6 })
              //   },
              //   pattern: {
              //     value: /^\S(.*\S)?$/,
              //     message: translate("error.trim")
              //   },
              // }}
            />
            {errors.name && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.name.message} {/*  || translate("error.required") */}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="emailReg">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  id="emailReg"
                  className="mt-1"
                  disabled={isPending}
                  inputMode="email"
                  status={errors.email ? "error" : ""}
                  autoComplete="email"
                  spellCheck={false}
                />
              )}
              // rules={{ 
              //   required: true, 
              //   pattern: {
              //     value: emailRegExp,
              //     message: translate("error.invalid")
              //   }
              // }}
            />
            {errors.email && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.email.message} {/*  || translate("error.required") */}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pwd">Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  id="pwd"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.password ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
              // rules={{
              //   required: true,
              //   minLength: {
              //     value: 6,
              //     message: translate("error.minLength", { v: 6 })
              //   },
              // }}
            />
            {errors.password && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.password.message} {/*  || translate("error.required") */}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPwd">Confirm password</label>
            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  id="confirmPwd"
                  className="mt-1"
                  disabled={isPending}
                  status={errors.password_confirmation ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
              // rules={{ 
              //   required: true,
              //   validate: (val: any) => val === password || "Konfirmasi password harus sama dengan password"
              // }}
            />
            {errors.password_confirmation && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.password_confirmation.message}
                {/*  || translate("error.required") */}
              </div>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            htmlType="submit"
            className="w-full mt-9"
            loading={isPending}
          >
            {translate("pages.register.buttons.submit")}
          </Button>

          <div className="text-center">
            {translate("pages.login.or")}

            <div className="text-center mt-2">
              {socialsProvider.map((item: any) =>
                <Button
                  key={item.name}
                  size="large"
                  icon={item.icon}
                  title={item.label}
                  className="mr-1"
                  onClick={() => register({ providerName: item.name })}
                />
              )}
            </div>
          </div>

          <p className="text-center border-t pt-4">
            {translate("pages.register.buttons.haveAccount")}
            {' '}
            <Link 
              to="/auth/login" 
              tabIndex={isPending ? -1 : 0} 
              className={(isPending ? "pe-none opacity-65 " : "") + "font-bold focus-visible_ring"}
            >
              {translate("pages.login.signin")}
            </Link>
          </p>
        </Form>
      }
    />
  );
}
