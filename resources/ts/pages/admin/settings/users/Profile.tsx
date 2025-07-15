import { useEffect } from "react"; // useState, 
import { HttpError } from "@refinedev/core"; // , useList
import { useForm } from "@refinedev/react-hook-form";
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { Button, Input, Col, Row, Spin } from 'antd'; // , Checkbox
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import isEqual from 'react-fast-compare';
import { Form } from '@/components/forms/Form';
import { SelectLazy } from '@/components/forms/SelectLazy';
import { AvatarInput } from '@/components/AvatarInput';
// import { IProfile } from './TYPES';
// import { IUser } from '@/types/Types';

const SALUTATIONS: any = ['Mr', 'Mrs', 'Ms'].map((id: string) => ({ id, value: id }));

export const Profile = ({
  loading,
  disabled,
  values,
  start,
}: any) => {
  const navigate = useNavigate();
  // const { push } = useNavigation();
  // const { open: openNotif } = useNotification();
  // const { data: currentUser } = useGetIdentity<any>();
  // const [initValue, setInitValue] = useState<any>();
  // const [firstOpenCompany, setFirstOpenCompany] = useState<boolean>(false);

  // const {
  //   data: dataBusinessUnit, 
  //   isLoading: isLoadingBusinessUnit,
  //   isFetching: isFetchingBusinessUnit,
  //   isRefetching: isRefetchingBusinessUnit,
  //   // isError: isErrorBusinessUnit,
  // } = useList<any>({
  //   queryOptions: {
  //     enabled: firstOpenCompany,
  //   },
  //   pagination: { mode: "off" },
  //   resource: "business-unit/get-all",
  // });

  // let loadingBusinessUnit = isLoadingBusinessUnit || isFetchingBusinessUnit || isRefetchingBusinessUnit;
  // // @ts-ignore
  // let businessUnits = dataBusinessUnit?.data;
  // // console.log('dataBusinessUnitUser: ', dataBusinessUnitUser)

  const {
    formState: { errors },
    refineCore: { formLoading, onFinish },
    control,
    handleSubmit,
    reset,
    // IUser, HttpError, IUser
  } = useForm<any, HttpError>({ // @ts-ignore
    resolver: yupResolver(
      yup.object({
        application_username: yup.string()
          .required("is required"),
          // .matches(/^[a-zA-Z0-9_]+$/i, { message: "Only alpha numeric and underscore" }), // , { excludeEmptyString: true }
        fullname: yup.string().required("is required").trim("No leading and trailing whitespace").strict(),
        email_address: yup.string().email("Not valid").required("is required"),
        // primary_team_id: yup.string().required("is required"),
        // assigned_business_units: yup.array().of(yup.string()).min(1, "is required").required("is required"),
        // employee_number: yup.string().required("is required"),
        application_password: yup.string().when('id', {
          is: (val?: string) => !val,
          then: (schema) => schema.required("is required"),
        }),
        salutation: yup.string().required("is required"),
        description: yup.string().nullable().trim("No leading and trailing whitespace").strict(),
        phone_number: yup.string().nullable().trim("No leading and trailing whitespace").strict(),
      })
    ),
    values, // : initialValues
    refineCoreProps: {
      queryOptions: {
        enabled: false,
      },
      redirect: false,
      resource: "application-user" + (values ? '' : '/create'),
      action: values ? "edit" : "create",
      id: values ? "update" : undefined,
      onMutationSuccess: () => { // res, val
        // values ? setInitValue(val) : push("/admin/users")
        !values && navigate("/settings/users")
      },
    },
  });

  useEffect(() => {
    if(values) reset(values); // initialValues
  }, [values]);

  let disabledOrLoading = disabled || !!loading || formLoading;

  // console.log('values: ', values)

  return (
    <Spin spinning={!!loading} wrapperClassName="pt-4">
      {start}

      <AvatarInput
        id={values?.id}
        disabled={disabledOrLoading}
        loading={loading}
        // value={values?.avatar}
      />

      <hr />

      <Form
        fieldsetClass="p-4 lg_pr-8 space-y-6"
        disabled={disabledOrLoading}
        onSubmit={handleSubmit(onFinish)} // doSubmit
      >
        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="uname">Username</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="application_username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  spellCheck={false}
                  autoComplete="username" // nickname | off
                  autoCapitalize="off"
                  autoCorrect="off"
                  id="uname"
                  disabled={disabledOrLoading}
                  readOnly={values?.application_username === 'system'}
                  status={errors.application_username ? "error" : ""}
                />
              )}
            />
            {errors.application_username && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.application_username.message}
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="fName">Full Name</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="fullname"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  id="fName"
                  disabled={disabledOrLoading}
                  status={errors.fullname ? "error" : ""}
                />
              )}
            />
            {errors.fullname && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.fullname.message}
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="sal">Salutation</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="salutation"
              control={control}
              render={({ field }) => (
                <SelectLazy
                  {...field}
                  className="w-full"
                  id="sal"
                  disabled={disabledOrLoading}
                  status={errors.salutation ? "error" : ""}
                  options={SALUTATIONS}
                />
              )}
            />
            {errors.salutation && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.salutation.message}
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="uEmail">Email</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="email_address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="uEmail"
                  type="email"
                  disabled={disabledOrLoading}
                  status={errors.email_address ? "error" : ""}
                />
              )}
            />
            {errors.email_address && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.email_address.message}
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="pn">Phone Number</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="pn"
                  allowClear
                  inputMode="tel"
                  disabled={disabledOrLoading}
                  status={errors.phone_number ? "error" : ""}
                />
              )}
            />
            {errors.phone_number && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.phone_number.message}
              </div>
            )}
          </Col>
        </Row>

        <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="desc">Description</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  id="desc"
                  allowClear
                  autoSize
                  disabled={disabledOrLoading}
                  status={errors.description ? "error" : ""}
                />
              )}
            />
            {errors.description && (
              <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                {errors.description.message}
              </div>
            )}
          </Col>
        </Row>

        {/* <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="dept">Company</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="primary_team_id" // primary_team_id
              control={control}
              render={({ field }) => (
                <SelectLazy
                  {...field}
                  value={firstOpenCompany && loadingBusinessUnit ? null : field.value}
                  className="w-full"
                  id="dept"
                  disabled={disabledOrLoading} //  || isErrorBusinessUnit
                  status={errors.primary_team_id ? "error" : ""}
                  loading={firstOpenCompany && loadingBusinessUnit}
                  fieldNames={{ label: "default_team_name", value: "default_team_id" }} // value: "default_team_id" | "business_unit_code"
                  optionFilterProp="default_team_name"
                  options={firstOpenCompany ? businessUnits : values ? [{ default_team_id: values?.primary_team_id, default_team_name: values?.primary_team_name }] : []}
                  onDropdownVisibleChange={(open: boolean) => {
                    open && setFirstOpenCompany(true)
                  }}
                />
              )}
            />
            {errors.primary_team_id && (
              <div className="mt-1 text-red-600 text-xs">
                {errors.primary_team_id.message}
              </div>
            )}
          </Col>
        </Row> */}

        {/* <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
            <label htmlFor="emNum">Employee Number</label>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="employee_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  id="emNum"
                  disabled={disabledOrLoading}
                  status={errors.employee_number ? "error" : ""}
                />
              )}
            />
            {errors.employee_number && (
              <div className="mt-1 text-red-600 text-xs">
                {errors.employee_number.message}
              </div>
            )}
          </Col>
        </Row> */}

        {!values && !loading && (
          <Row gutter={[24, 4]}>
            <Col lg={6} xs={24}>
              <label htmlFor="pwd">Password</label>
            </Col>
            <Col lg={18} xs={24}>
              <Controller
                name="application_password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    allowClear
                    id="pwd"
                    spellCheck={false}
                    autoComplete="new-password" // off
                    autoCapitalize="off"
                    autoCorrect="off"
                    disabled={disabledOrLoading}
                    status={errors.application_password ? "error" : ""}
                  />
                )}
              />
              {errors.application_password && (
                <div className="mt-1 text-red-600 text-xs">{/* @ts-ignore */}
                  {errors.application_password.message}
                </div>
              )}

              {/* <div className="mt-6 space-x-2 p-2 border rounded shadow">
                <Checkbox
                  // onChange={onChange}
                  disabled={formLoading}
                >
                  System Administrator
                </Checkbox>
                <Checkbox
                  // onChange={onChange}
                  disabled={formLoading}
                >
                  Administrator
                </Checkbox>
              </div> */}
            </Col>
          </Row>
        )}

        {/* <Row gutter={[24, 4]}>
          <Col lg={6} xs={24}>
          </Col>
          <Col lg={18} xs={24}>
            <Controller
              name="is_guest"
              control={control}
              render={({ field: { value, ...restField } }) => (
                <Checkbox
                  {...restField}
                  id="isGuest"
                  disabled={disabledOrLoading}
                  checked={!!value}
                  className="border border-gray-300 hover_border-sky-500 rounded-lg py-1.5 px-2"
                >
                  User is Guest
                </Checkbox>
              )}
            />
          </Col>
        </Row> */}

        <div className="text-center">
          <Button 
            htmlType="submit" 
            type="primary"
            loading={formLoading}
          >
            Save
          </Button>
        </div>
      </Form>
    </Spin>
  )
}

// const doSubmit = (newValues: any) => { // IUser
//   const { company: com, assigned_business_units, ...restNewValues } = newValues;
//   // @ts-ignore
//   const newAssignmentCompany = (assigned_business_units || []).join(',');
//   const fixNewValues = {
//     ...restNewValues, 
//     assigned_business_units: newAssignmentCompany,
//   };

//   if(values){
//     onFinish(fixNewValues);
//   }else{
//     let fixInitValues;
//     if(initValue){
//       fixInitValues = { ...initValue, assigned_business_units: newAssignmentCompany }
//     }else{
//       const { company, ...restValues } = values;
//       fixInitValues = { ...restValues };
//     }

//     if(isEqual(fixNewValues, fixInitValues)){
//       const successful = translate('notifications.success');
//       openNotif?.({
//         type: "success",
//         message: `${successful} ${translate('buttons.edit')} user`,
//         description: successful,
//       });
//     }else{
//       onFinish(fixNewValues);
//     }
//   }
// };
