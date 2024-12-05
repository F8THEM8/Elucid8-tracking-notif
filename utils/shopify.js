const fetchOrderData = async (orderNumber, email) => {
  const response = await fetch(
    `https://elucid8-jewelry.com/admin/api/2024-01/orders.json?name=${orderNumber}&email=${email}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
    }
  );
 const data = await response.json();
  console.log("Shopify Order Data:", data);  // Log the response for debugging

  const { orders } = await response.json();
  return orders.length > 0 ? orders[0] : null;
};

export default fetchOrderData;
