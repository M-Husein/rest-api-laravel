// import { useState } from "react";
import { HttpError, useTranslate, useActiveAuthProvider, useRegister } from "@refinedev/core"; // , RegisterFormTypes
import { Input, Button } from "antd"; // , Radio
import { Link } from "react-router-dom";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form'; // useForm, 
// import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
// import { FaRegUser } from "react-icons/fa";
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { socialsProvider } from '@/providers/socialsProvider';
import { email as emailRegExp } from '@/utils/regExp';

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
  const { mutate: register, isLoading } = useRegister<any>({ // <RegisterFormTypes>
    v3LegacyAuthProviderCompatible: !!authProvider?.isLegacy 
  });

  const {
    formState: { errors },
    control,
    handleSubmit, 
    watch,
  } = useForm<IFormValues, HttpError, IFormValues>();

  const password = watch('password');

  const doRegister = (values: any) => {
    // console.log('values: ', values);
    register({ ...values, type: "spa" });
  }

  return (
    <Layout
      title="Register"
      form={
        <Form
          disabled={isLoading}
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
                  disabled={isLoading}
                  status={errors.name ? "error" : ""}
                  autoComplete="name"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              )}
              rules={{ 
                required: true,
                minLength: {
                  value: 2,
                  message: translate("error.minLength", { v: 6 })
                },
                pattern: {
                  value: /^\S(.*\S)?$/,
                  message: translate("error.trim")
                },
              }}
            />
            {errors.name && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.name.message || translate("error.required", { name: "Name" })}
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
                  disabled={isLoading}
                  inputMode="email"
                  status={errors.email ? "error" : ""}
                  autoComplete="email"
                  spellCheck={false}
                />
              )}
              rules={{ 
                required: true, 
                pattern: {
                  value: emailRegExp,
                  message: translate("error.invalid", { name: "Email" })
                }
              }}
            />
            {errors.email && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.email.message || translate("error.required", { name: "Email" })}
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
                  disabled={isLoading}
                  status={errors.password ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
              rules={{
                required: true,
                minLength: {
                  value: 6,
                  message: translate("error.minLength", { v: 6 })
                },
              }}
            />
            {errors.password && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.password.message || translate("error.required", { name: "Password" })}
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
                  disabled={isLoading}
                  status={errors.password_confirmation ? "error" : ""}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
              rules={{ 
                required: true,
                validate: (val: any) => val === password || "Konfirmasi password harus sama dengan password"
              }}
            />
            {errors.password_confirmation && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.password_confirmation.message || translate("error.required", { name: "Confirm password" })}
              </div>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            htmlType="submit"
            className="w-full mt-9"
            loading={isLoading}
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
              tabIndex={isLoading ? -1 : 0} 
              className={(isLoading ? "pe-none opacity-65 " : "") + "font-bold focus-visible_ring"}
            >
              {translate("pages.login.signin")}
            </Link>
          </p>
        </Form>
      }
    />
  );
}
