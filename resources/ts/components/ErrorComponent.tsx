import { useEffect } from "react"; // , useState
import { useGo, useRouterType } from "@refinedev/core"; // , useResource
import { RefineErrorPageProps } from "@refinedev/ui-types";
import { Button, Result } from "antd";
import { useNavigation } from "@refinedev/core";

// const { Text } = Typography;

/**
 * When the app is navigated to a non-existent route, refine shows a default error page.
 * A custom error component can be used for this error page.
 *
 * @see {@link https://refine.dev/docs/packages/documentation/routers/} for more details.
 */
export const ErrorComponent: React.FC<RefineErrorPageProps> = () => {
  // const [errorMessage, setErrorMessage] = useState<string>();
  const { push } = useNavigation();
  const go = useGo();
  const routerType = useRouterType();

  // const { resource, action } = useResource();

  // useEffect(() => {
  //   if (resource) {
  //     if (action) {
  //       setErrorMessage(
  //         translate(
  //           "pages.error.info",
  //           {
  //             action: action,
  //             resource: resource?.name,
  //           },
  //           `You may have forgotten to add the "${action}" component to "${resource?.name}" resource.`,
  //         ),
  //       );
  //     }
  //   }
  // }, [resource, action]);

  useEffect(() => {
    document.getElementById('loaderApp')?.classList.add('hidden');
  }, []);

  return (
    <Result
      status="404"
      title="404"
      extra={
        <div>
          <p>Sorry, the page you visited does not exist.</p>

          <Button
            type="primary"
            onClick={() => {
              routerType === "legacy" ? push("/") : go({ to: "/" })

              // if (routerType === "legacy") {
              //   push("/");
              // } else {
              //   go({ to: "/" });
              // }
            }}
          >
            Back to Home
          </Button>
        </div>
      }
    />
  );
}
