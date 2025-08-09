// import { useEffect } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useTranslate, useActiveAuthProvider, useLogin } from "@refinedev/core";
import { Input, Button, Checkbox } from "antd";
import { Link } from "react-router-dom";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from 'react-hook-form'; // useForm, 
// import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { z } from "zod";
// import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from '@/components/layout/auth/Layout';
import { Form } from '@/components/forms/Form';
import { socialsProvider } from '@/providers/socialsProvider';
import { openWindow } from '@/utils/browser';
// import { email as emailRegExp } from '@/utils/regExp';

type IFormValues = {
  email: string;
  password: string;
  remember?: boolean;
  providerName?: string; // providerName | provider
}

const TITLE_PAGE = "Login";

/**
 * **refine** has a default login page form which is served on `/login` route when the `authProvider` configuration is provided.
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/components/antd-auth-page/#login} for more details.
 */
export default function Page(){
  useDocumentTitle(TITLE_PAGE + " • " + APP.name);

  // const navigate = useNavigate();
  // const { token } = theme.useToken();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: login, isPending } = useLogin<any>({ 
    v3LegacyAuthProviderCompatible: !!authProvider?.isLegacy 
  });

  const {
    formState: { errors },
    control,
    handleSubmit, 
  } = useForm<IFormValues, HttpError, IFormValues>({
    resolver: zodResolver(
      z.object({
        email: z.email(), // translate("error.invalid")
        password: z.string().min(6), // translate("error.minLength", { v: 6 })
        remember: z.boolean().optional(),
        providerName: z.string().optional(),
      })
    ),
  });

  const inputProps: any = {
    size: "large",
    disabled: isPending,
    className: "mt-1",
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
  };

  const disabledLink = (cls?: string) => ({
    tabIndex: isPending ? -1 : 0,
    className: (isPending ? "pe-none opacity-65 " : "") + "focus-visible_ring " + cls,
  });

  const doLogin = (values: any) => { // IFormValues
    if(values.providerName){
      // const windowOpen = window.open(
      //   `/api/v${APP.version}/auth/social/redirect/${values.providerName}`,
      //   '_blank',
      //   'width=600,height=700'
      // );
      const windowOpen = openWindow(
        `/api/v${APP.version}/auth/social/redirect/${values.providerName}`,
        'Auth ' + values.providerName, 
        500, 
        650
      );

    }else{
      login(values);
    }
  }

  return (
    <Layout
      title={TITLE_PAGE}
      form={
        <Form
          disabled={isPending}
          onSubmit={handleSubmit(doLogin)}
          fieldsetClass="space-y-6"
        >
          <div>
            <label htmlFor="eml">{translate("pages.login.fields.email")}</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  {...inputProps}
                  status={errors.email ? "error" : ""}
                  id="eml"
                  inputMode="email"
                />
              )}
            />
            {errors.email && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.email.message}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pwd">{translate("pages.login.fields.password")}</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...inputProps}
                  status={errors.password ? "error" : ""}
                  id="pwd"
                  autoComplete="off"
                />
              )}
            />
            {errors.password && (
              <div className="mt-1 text-red-700 text-xs">
                {errors.password.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap">
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  {...field} 
                  checked={field.value}
                  disabled={isPending}
                  className="mr-2"
                >
                  {translate("pages.login.buttons.rememberMe")}
                </Checkbox>
              )}
            />

            <Link 
              to="/auth/forgot-password" 
              {...disabledLink("text-gray-500 ml-auto")}
            >
              {translate("pages.login.buttons.forgotPassword")}
            </Link>
          </div>

          <Button
            block
            type="primary"
            size="large"
            htmlType="submit"
            loading={isPending}
          >
            {translate("pages.login.signin")}
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
                  onClick={() => doLogin({ providerName: item.name })}
                />
              )}
            </div>
          </div>
          
          <p className="text-center border-t pt-4">
            {translate('pages.login.buttons.noAccount')}
            {' '}
            <Link 
              to="/auth/register" 
              {...disabledLink("font-bold")}
            >
              {translate("pages.login.signup")}
            </Link>
          </p>
        </Form>
      }
    />
  );
}
