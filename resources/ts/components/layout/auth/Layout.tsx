import { Card, Col } from "antd";
import { Link } from 'react-router-dom';
import { useDocumentTitle } from "@refinedev/react-router-v6";

export const Layout = ({
  title,
  form,
}: any) => {
  useDocumentTitle(title + " • " + APP.name);

  return (
    <div className="flex min-h-fullscreen p-4 bg-gray-200 bg-theme">
      <Col md={6} xs={24} className="m-auto">
        <p className="text-center">
          <Link 
            to="/" 
            className="inline-block focus-visible_ring"
          >
            <img 
              height={45}
              alt={APP.name} 
              src="/logo-36x36.png"
            />
          </Link>
        </p>

        <Card className="shadow">
          {form}
        </Card>
      </Col>
    </div>
  );
}
