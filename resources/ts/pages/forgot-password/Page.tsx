import {
  ForgotPasswordPageProps,
  ForgotPasswordFormTypes,
  useForgotPassword,
} from "@refinedev/core";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  LayoutProps,
  CardProps,
  FormProps,
  // theme,
} from "antd";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { Link } from "react-router-dom";

type ResetPassworProps = ForgotPasswordPageProps<
  LayoutProps,
  CardProps,
  FormProps
>;

const APP_NAME = import.meta.env.VITE_APP_NAME;
const centered = "flex justify-center items-center ";

/**
 * **refine** has forgot password page form which is served on `/forgot-password` route when the `authProvider` configuration is provided.
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/components/antd-auth-page/#forgot-password} for more details.
 */
const ForgotPasswordPage: React.FC<ResetPassworProps> = () => {
  useDocumentTitle("Forgot Password - " + APP_NAME);

  // const { token } = theme.useToken();
  const [form] = Form.useForm<ForgotPasswordFormTypes>();
  const { mutate: forgotPassword, isLoading } = useForgotPassword<ForgotPasswordFormTypes>();

  return (
    <Layout>
      <div className={centered + "flex-col min-h-screen py-4"}>
        <Card
          styles={{
            header: { borderBottom: 0, padding: 0 },
            body: { padding: 0 },
          }}
          // style={{ backgroundColor: token.colorBgElevated }}
          className="w-full max-w-sm p-7 shadow"
        >
          <h1 className={centered + "mb-6 text-xl font-bold"} translate="no">
            <img width={29} src="/logo-36x36.png" alt={APP_NAME} className="mr-2" />
            {APP_NAME}
          </h1>
          <h2
            className="text-center text-lg mb-4 pb-4"
            // style={{ color: token.colorPrimaryTextHover }}
          >
            Forgot your password?
          </h2>

          <Form<ForgotPasswordFormTypes>
            layout="vertical"
            form={form}
            onFinish={(values) => forgotPassword(values)}
            requiredMark={false}
            disabled={isLoading}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true },
                { whitespace: true },
                // {
                //   type: "email",
                //   message: translate("pages.forgotPassword.errors.validEmail")
                // },
              ]}
            >
              <Input
                size="large"
                disabled={isLoading}
                spellCheck={false}
                autoCapitalize="off"
              />
            </Form.Item>

            <div className="text-right">
              Have an account?
              {" "}
              <Link
                to="/auth/login"
                className={"focus_ring font-medium" + (isLoading ? " pe-none opacity-60" : "")}
                tabIndex={isLoading ? -1 : 0}
                // style={{ color: token.colorPrimaryTextHover }}
              >
                Login
              </Link>
            </div>

            <Form.Item
              style={{
                marginTop: 24,
                marginBottom: 0,
              }}
            >
              <Button
                block
                type="primary"
                size="large"
                htmlType="submit"
                loading={isLoading}
              >
                Send reset instructions
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
