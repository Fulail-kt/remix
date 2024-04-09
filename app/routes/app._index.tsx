import { LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Card, Layout, List, Page } from "@shopify/polaris"
import { apiVersion, authenticate } from "~/shopify.server"
import { DataTable } from '@shopify/polaris';


export const query=`
{
  orders(first:10){
    edges{
      node{
        id
        name
        email
        phone
        processedAt
      }
    }
  }
}
`
export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop} = session;
  const accessToken=process.env.SHOPIFY_ACCESS_TOKEN
  try {
    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken!,
      },
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const data = await response.json();
      const {
        data: {
          orders: { edges },
        },
      } = data;
      return edges.map(({ node }:{node:any}) => ({
        id: node.id,
        name: node.name,
        email: node.email || "N/A",
        phone: node.phone || "N/A",
        processedAt: new Date(node.processedAt).toLocaleString(),
      }));
    } else {
      console.error("Error fetching orders:", response.statusText);
      return []; 
    }
  } catch (error) {
    console.error(error);
    return []; 
  }
};

const index = () => {
  const orders: any = useLoaderData();

  const rows = orders.map((order:any) => [
    order.id,
    order.name,
    order.email,
    order.phone,
    order.processedAt
  ]);

  const columns = [
    { header: 'ID'},
    { header: 'Name'},
    { header: 'Email'},
    { header: 'Phone'},
    { header: 'Processed At'},
  ];

  return (
    <Page title="Orders">
  
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
            'numeric',
            'text',
          ]}
          headings={columns.map(column => column.header)}
          rows={rows}
        
        />
    
    </Page>

  )
};

export default index