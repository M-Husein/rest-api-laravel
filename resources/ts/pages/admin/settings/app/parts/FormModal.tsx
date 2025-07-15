// import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
// import { useGetLocale } from "@refinedev/core"; // , useSetLocale, useTranslate
import { Controller } from 'react-hook-form';
import { Modal, Input } from 'antd'; // Tabs
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

export const FormModal = ({
  control,
  errors,
  values,
  disabled,
  onSubmit,
  ...etc
}: any) => {
  const { i18n } = useTranslation();
  // const locale = useGetLocale();
  // const currentLocale = locale();
  const supportedLocales = i18n.languages || Object.keys(APP.locales);
  const hasId = values?.id;
  const isCustom = values?.is_custom === 0;
  // const [tabActive, setTabActive] = useState<any>(currentLocale);

  // console.log('i18n: ', i18n);

  // const items = supportedLocales.map((key) => {
  //   let label = key.toUpperCase();
  //   return {
  //     key,
  //     label,
  //     children: (
  //       <Fragment key={key}>
  //         <Controller
  //           name={`text.${key}`}
  //           control={control}
  //           render={({ field }) => (
  //             <Input.TextArea
  //               {...field}
  //               id={"ts" + key}
  //               rows={4}
  //               placeholder={`Translation for ${label}`}
  //               disabled={disabled}
  //               status={errors.text?.[key] ? "error" : ""}
  //             />
  //           )}
  //           // Apply validation rules. Consider making the current locale's translation required.
  //           rules={{
  //             ...VALIDATIONS,
  //             required: {
  //               // value: key === i18n.language, // Only require translation for the currently active locale
  //               value: key === tabActive,
  //               message: `Translation for ${label} is required`
  //             }
  //           }}
  //         />
  //         {errors.text?.[key] && (
  //           <div className="mt-1 text-red-600 text-xs">
  //             {errors.text[key].message}
  //           </div>
  //         )}
  //       </Fragment>
  //     )
  //   }
  // });

  return (
    <Modal
      {...etc}
      // width={450}
      style={{ top: 15 }}
      keyboard={false}
      maskClosable={false}
      closeIcon={!disabled}
      title={(hasId ? 'Edit' : 'Create') + " Translation" + (values?.is_custom || !hasId ? "" : " (Default)")}
      okText="Save"
      okButtonProps={{ 
        htmlType: "submit", 
        form: "formModal",
        loading: disabled
      }}
      cancelButtonProps={{ disabled }}
      // footer={(x: any, { OkBtn }: any) => <OkBtn />}
      open={!!values}
      // onCancel={doCancel}
    >
      <Form
        id="formModal"
        className="mt-6"
        fieldsetClass="space-y-4"
        disabled={disabled}
        onSubmit={onSubmit}
      >
        <div>
          <label htmlFor="grp">Group</label>
          <Controller
            name="group"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="grp"
                className="mt-1"
                disabled={disabled || isCustom}
                status={errors.group ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />
          {errors.group && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.group.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="q">key</label>
          <Controller
            name="key"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="q"
                className="mt-1"
                disabled={disabled || isCustom}
                status={errors.key ? "error" : ""}
              />
            )}
            rules={VALIDATIONS}
          />
          {errors.key && (
            <div className="mt-1 text-red-600 text-xs">
              {errors.key.message}
            </div>
          )}
        </div>

        <div>
          <div>Translations</div>
          {supportedLocales.map((locale) => (
            <div key={locale} className="mb-4">
              <label htmlFor={`ts${locale}`}>{locale.toUpperCase()}</label>
              <Controller
                name={`text.${locale}`} // Nested name for react-hook-form: text.en, text.id, etc.
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    id={`ts${locale}`}
                    className="mt-1"
                    rows={4}
                    // placeholder="Enter translation"
                    disabled={disabled}
                    status={errors.text?.[locale] ? "error" : ""}
                  />
                )}
                rules={VALIDATIONS}
              />
              {errors.text?.[locale] && (
                <div className="mt-1 text-red-600 text-xs">
                  {errors.text[locale].message}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* <div>
          <label htmlFor={"ts" + tabActive}>Translations</label>
          <Tabs
            className="mt-1"
            size="small"
            // type="card"
            items={items}
            // defaultActiveKey={i18n.language} // Default to current active locale tab
            activeKey={tabActive}
            onChange={setTabActive}
          />
        </div> */}
      </Form>
    </Modal>
  );
}
