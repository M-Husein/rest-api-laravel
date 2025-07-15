// import { useCan, CanAccess } from "@refinedev/core";
import { Button, Result } from 'antd';
import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="warning" // 403
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button 
          type="primary"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      }
    />
  );
}

// export const Unauthorized = ({
//   children,
//   fallback,
//   ...etc
// }: any) => {
//   // {
//   //   resource: "users",
//   //   action: "show",
//   //   params: { id: 1 },
//   // }
//   const { data: show } = useCan(etc);
//   const navigate = useNavigate();

//   if (!show?.can) {
//     return fallback || (
//       <Result
//         status="warning" // 403
//         title="403"
//         subTitle="Sorry, you are not authorized to access this page."
//         extra={
//           <Button 
//             type="primary"
//             onClick={() => navigate("/")}
//           >
//             {translate("backHome")}
//           </Button>
//         }
//       />
//     );
//   }

//   return children;
// }

/*
<CanAccess
  resource="users"
  action="block"
  params={{ id: 1 }}
  fallback={"You are not authorized."}
>
  // Only authorized users can see this button.
  <BlockUserButton />
</CanAccess>
*/