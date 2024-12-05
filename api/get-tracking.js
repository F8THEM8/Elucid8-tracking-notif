import fetchOrderData from "../utils/shopify.js";
import fetchTrackingDetails from "../utils/shippo.js";

export default async (req, res) => {
  // Set CORS headers to allow requests from your domain
  res.setHeader("Access-Control-Allow-Origin", "https://elucid8-jewelry.com/");  // Replace '*' with your specific domain for better security (e.g., "https://elucid8-jewelry.com")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS preflight request (sent by browsers before POST requests)
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respond with OK for preflight
  }

  // Restrict to POST method
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const { orderNumber, email } = req.body;

  try {
    // Fetch order details from Shopify using the order number and email
    const orderData = await fetchOrderData(orderNumber, email);
    if (!orderData) {
      return res.status(404).send({ error: "Order not found." });
    }

    const trackingNumber = orderData.tracking_number;

    // Fetch tracking details from Shippo using the tracking number
    const trackingData = await fetchTrackingDetails(trackingNumber);

    res.status(200).json({
      trackingNumber,
      status: trackingData.tracking_status.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error." });
  }
};
