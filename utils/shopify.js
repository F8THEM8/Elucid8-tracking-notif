const fetchOrderData = async (orderNumber, email) => {
  // Helper function to add a delay for retries
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let attempt = 0;
  const maxAttempts = 3;
  let orderData = null;

  // Retry logic in case of failure
  while (attempt < maxAttempts) {
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

    // Log the full response for debugging purposes
    const responseText = await response.text();
    console.log("Shopify API Response:", responseText);

    // If the request was successful, break out of the loop
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("Shopify Order Data:", data);  // Log the order data for debugging

      const { orders } = data;
      orderData = orders.length > 0 ? orders[0] : null;
      if (orderData) {
        break;  // Order found, exit the loop
      }
    } else {
      console.error(`Attempt ${attempt + 1} failed. Status: ${response.status}, Response: ${responseText}`);
      attempt++;
      await delay(1000);  // Retry after 1 second
    }
  }

  if (!orderData) {
    console.error(`Order not found after ${maxAttempts} attempts.`);
    return null;  // Return null if no order found
  }

  return orderData;
};

export default fetchOrderData;
