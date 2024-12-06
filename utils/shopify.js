const { GraphqlClient } = require('@shopify/shopify-api');

const fetchOrderData = async (orderNumber, email) => {
  const queryString = `
    query($orderNumber: String!, $email: String!) {
      orders(first: 1, query: "name:${orderNumber} AND email:${email}") {
        edges {
          node {
            id
            name
            email
            displayFulfillmentStatus
            fulfillments(first: 1) {
              trackingInfo {
                number
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Initialize the Shopify GraphQL client with environment variable for SHOPIFY_SHOP_NAME
    const client = new GraphqlClient({
      domain: process.env.SHOPIFY_SHOP_NAME, // Access environment variable
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN, // Access environment variable
    });

    // Execute the query
    const response = await client.query({
      data: {
        query: queryString,
        variables: { orderNumber, email },
      },
    });

    const orders = response.body.data.orders.edges;

    // If no order found
    if (!orders.length) {
      return null;
    }

    // Extract order details
    const order = orders[0].node;
    const trackingInfo = order.fulfillments[0]?.trackingInfo || [];
    const trackingNumber = trackingInfo.length ? trackingInfo[0].number : null;

    return {
      orderName: order.name,
      email: order.email,
      trackingNumber,
      fulfillmentStatus: order.displayFulfillmentStatus,
    };
  } catch (error) {
    console.error('Error fetching order data:', error);
    throw new Error('Failed to fetch order data from Shopify.');
  }
};

module.exports = fetchOrderData;
