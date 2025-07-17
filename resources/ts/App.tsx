import { lazy, Suspense } from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { ErrorComponent } from "@/components/ErrorComponent";
import type { I18nProvider } from "@refinedev/core";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource } from "@refinedev/react-router-v6"; // , UnsavedChangesNotifier
// import { ConfigProvider, App as AntdApp } from "antd";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dataProvider } from "@/providers/dataProvider"; // @refinedev/simple-rest
import { authProvider } from "@/providers/authProvider";
import { AppTheme, AppContextProvider } from "@/contexts/app/Context";
import { useNotificationProvider } from "@/providers/notificationProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashScreen } from '@/components/SplashScreen';
// import { Layout } from '@/components/layout/main/Layout';
import { lazyComponent } from '@/utils/components';
import { RESOURCES } from '@/routes/resources';

// Pages:
// const Home = lazy(() => import('@/pages/home/Page'));
const Login = lazy(() => import('@/pages/login/Page'));
const Register = lazy(() => import('@/pages/register/Page'));
const ForgotPassword = lazy(() => import('@/pages/forgot-password/Page'));
const EmailVerification = lazy(() => import('@/pages/verification/email/Page'));
// Admin
const AdminHome = lazy(() => import('@/pages/admin/home/Page'));

// Settings
const AppSettings = lazy(() => import('@/pages/admin/settings/app/Page'));
// const UserManagement = lazy(() => import('@/pages/admin/settings/users/Page'));
// const ShowUser = lazy(() => import('@/pages/admin/settings/users/Show'));
// const CreateUser = lazy(() => import('@/pages/admin/settings/users/Create'));

// const RolesPermissions = lazy(() => import('@/pages/admin/settings/roles-permissions/Page'));
// const Teams = lazy(() => import('@/pages/admin/settings/teams/Page'));
// const ShowTeam = lazy(() => import('@/pages/admin/settings/teams/Show'));

// const Adverts = lazy(() => import('@/pages/admin/adverts/Page'));
// const CreateAdvert = lazy(() => import('@/pages/admin/adverts/Create'));
// const ShowAdvert = lazy(() => import('@/pages/admin/adverts/Show'));

// const Currencies = lazy(() => import('@/pages/admin/currencies/Page'));
// const City = lazy(() => import('@/pages/admin/city/Page'));
// const Province = lazy(() => import('@/pages/admin/province/Page'));
// const Country = lazy(() => import('@/pages/admin/country/Page'));

const LayoutAdmin = lazy(() => import('@/components/layout/admin/default'));

const lazyApp = (component: any) => (
	<ErrorBoundary>
		<Suspense fallback={<SplashScreen />}>
			{component}
		</Suspense>
	</ErrorBoundary>
);

const customTitleHandler = () => document.title || import.meta.env.VITE_APP_NAME;

const RefineProvider = () => {
  const { t, i18n } = useTranslation();

  const i18nProvider: I18nProvider = { // @ts-ignore
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <AppTheme>
      <Refine 
        dataProvider={dataProvider(APP.api)} // import.meta.env.VITE_API
        i18nProvider={i18nProvider}
        notificationProvider={useNotificationProvider}
        routerProvider={routerBindings}
        authProvider={authProvider}
        resources={RESOURCES}
        options={{
          // warnWhenUnsavedChanges: true,
          disableTelemetry: true,
          syncWithLocation: false, // default true : https://refine.dev/docs/api-reference/core/components/refine-config/#syncwithlocation
          useNewQueryKeys: true,
          /** @DOCS : https://refine.dev/docs/core/refine-component/#redirect */
          redirect: {
            // If the resource doesn't have a show page defined, the user will be redirected to the list page.
            afterCreate: false, // "show"
            // If the mutation mode is `undoable` or `optimistic`, the redirect happens before the mutation succeeds. Therefore, if there is no known `id` value, the user will be redirected to the list page.
            // afterClone: "edit",
            // If set to `false`, no redirect is performed after a successful form mutation.
            afterEdit: false,
          },
          /** @DOCS : https://refine.dev/docs/core/refine-component/#reactquery */
          reactQuery: {
            clientConfig: {
              defaultOptions: {
                queries: {
                  // staleTime: Infinity,
                  retry: false,
                },
              },
            },
          },
        }}
      >
        <AppContextProvider>
          <Outlet />
        </AppContextProvider>

        {/* <UnsavedChangesNotifier /> */}

        <DocumentTitleHandler
          handler={customTitleHandler}
        />
      </Refine>
    </AppTheme>
  );
}

const LayoutPrivate = () => (
  <Authenticated
    key="authenticated-inner"
    fallback={<CatchAllNavigate to="/auth/login" />}
  >
    {lazyApp(
      <LayoutAdmin>
        <Outlet />
      </LayoutAdmin>
    )}
  </Authenticated>
);

const LayoutAuth = () => (
  <Authenticated
    key="authenticated-outer"
    fallback={<Outlet />}
  >
    <NavigateToResource />
  </Authenticated>
);

const router = createBrowserRouter([
  {
    Component: RefineProvider,
    children: [
      // {
      //   path: "/",
      //   // element: <Layout><Outlet /></Layout>,
      //   children: [
      //     { index: true, element: lazyComponent(Home, <SplashScreen />) },
      //     // { path: "/ordering-status", element: lazyComponent(OrderingStatus, <SplashScreen />) },
      //     { path: "/menu/:id", element: lazyComponent(Menu, <SplashScreen />) },
      //   ],
      // },
      {
        path: "email/verify/:id/:hash",
        // element: <Layout><Outlet /></Layout>,
        children: [
          { index: true, element: lazyComponent(EmailVerification, <SplashScreen />) },
        ],
      },
      {
        path: "/app", // /admin
        element: <LayoutPrivate />,
        children: [
          { index: true, element: lazyComponent(AdminHome) },
          // {
          //   path: "adverts", 
          //   children: [
          //     { index: true, element: lazyComponent(Adverts) },
          //     { path: "create", element: lazyComponent(CreateAdvert) },
          //     { path: ":id", element: lazyComponent(ShowAdvert) },
          //   ]
          // },
          // {
          //   path: "classification",
          //   element: lazyComponent(Classification),
          // },
          // {
          //   path: "currencies", 
          //   children: [
          //     { index: true, element: lazyComponent(Currencies) },
          //     // { path: ":id", element: lazyComponent(ShowTeam) },
          //   ]
          // },
          // {
          //   path: "country", 
          //   children: [
          //     { index: true, element: lazyComponent(Country) },
          //     // { path: ":id", element: lazyComponent(ShowTeam) },
          //   ]
          // },
          // {
          //   path: "province", 
          //   children: [
          //     { index: true, element: lazyComponent(Province) },
          //     // { path: ":id", element: lazyComponent(ShowTeam) },
          //   ]
          // },
          // {
          //   path: "city", 
          //   children: [
          //     { index: true, element: lazyComponent(City) },
          //     // { path: ":id", element: lazyComponent(ShowTeam) },
          //   ]
          // },
          {
            path: "settings",
            children: [
              { path: "app", element: lazyComponent(AppSettings) },
              // {
              //   path: "users",
              //   children: [
              //     { index: true, element: lazyComponent(UserManagement) },
              //     { path: "create", element: lazyComponent(CreateUser) },
              //     { path: ":id", element: lazyComponent(ShowUser) },
              //   ],
              // },
              // { path: "roles-permissions", element: lazyComponent(RolesPermissions) },
              // {
              //   path: "teams", 
              //   children: [
              //     { index: true, element: lazyComponent(Teams) },
              //     { path: ":id", element: lazyComponent(ShowTeam) },
              //   ]
              // }
            ],
          },
        ]
      },
      {
        path: '/auth',
        element: <LayoutAuth />,
        children: [
          { path: "login", element: lazyComponent(Login, <SplashScreen />) },
          { path: "register", element: lazyComponent(Register, <SplashScreen />) },
          { path: "forgot-password", element: lazyComponent(ForgotPassword, <SplashScreen />) },
        ],
      },
      { path: "*", Component: ErrorComponent },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true, // Enables relative paths in nested routes
    v7_fetcherPersist: true,   // Retains fetcher state during navigation
    v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
    v7_partialHydration: true, // Supports partial hydration for server-side rendering
    v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
  },
});

export function App(){
	return (
		<RouterProvider
			future={{
			  v7_startTransition: true,
			}}
			router={router}
		/>
	);
}
