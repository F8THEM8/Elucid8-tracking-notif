const fetchOrderData = async (orderNumber, email) => {
  const response = await fetch(
    `https://7r4f3s-11.myshopify.com/admin/api/2024-01/orders.json?name=${orderNumber}&email=${email}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
    }
  );

  const { orders } = await response.json();
  return orders.length > 0 ? orders[0] : null;
};

export default fetchOrderData;
