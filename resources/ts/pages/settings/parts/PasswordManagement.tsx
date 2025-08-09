import { Controller } from 'react-hook-form';
import { Input, Button, Col } from 'antd';
import { Form } from '@/components/forms/Form';

export const PasswordManagement = ({
  t,
  user,
  control,
  errors,
  loading,
  onSubmit,
  onClick,
}: any) => {
  const inputProps: any = {
    disabled: loading,
    className: "mt-1",
    spellCheck: false,
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
  };

  // console.log('user: ', user);

  if(user?.has_password){
    return (
      <Form
        // fieldsetClass="space-y-4"
        // method="post"
        autoComplete="off"
        disabled={loading}
        onSubmit={onSubmit}
      >
        <Col md={11} xs={24} className="space-y-4 p-4 mx-auto">
          <div>
            <label htmlFor="cp">Current Password</label>
            <Controller
              name="current_password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...inputProps}
                  id="cp"
                  // autoComplete="current-password"
                  status={errors.current_password ? "error" : ""}
                />
              )}
              // rules={VALIDATIONS}
            />
            {errors.current_password && (
              <div className="mt-1 text-red-600 text-xs">
                {errors.current_password.message}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="npwd">New Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...inputProps}
                  id="npwd"
                  // autoComplete="new-password"
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

          <div>
            <label htmlFor="cpwd">Confirm Password</label>
            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  {...inputProps}
                  id="cpwd"
                  // autoComplete="new-password"
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

          <div className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {t('buttons.save')}
            </Button>
          </div>
        </Col>
      </Form>
    );
  }

  return (
    <Button
      type="primary"
      loading={loading}
      onClick={onClick}
    >
      Request set password
    </Button>
  );
}
