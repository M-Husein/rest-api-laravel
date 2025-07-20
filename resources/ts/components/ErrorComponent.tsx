import { useEffect } from "react"; // , useState
// import { useResource } from "@refinedev/core";
import { RefineErrorPageProps } from "@refinedev/ui-types";
import { Button, Result } from "antd";
import { useNavigation } from "@refinedev/core";
import { toggleLoaderApp } from '@/utils/dom';

/**
 * When the app is navigated to a non-existent route, refine shows a default error page.
 * A custom error component can be used for this error page.
 *
 * @see {@link https://refine.dev/docs/packages/documentation/routers/} for more details.
 */
export const ErrorComponent: React.FC<RefineErrorPageProps> = () => {
  // const [errorMessage, setErrorMessage] = useState<string>();
  const { push } = useNavigation();

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
    // document.getElementById('loaderApp')?.classList.add('hidden');
    toggleLoaderApp();
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
            onClick={() => push("/")}
          >
            Back to Home
          </Button>
        </div>
      }
    />
  );
}
