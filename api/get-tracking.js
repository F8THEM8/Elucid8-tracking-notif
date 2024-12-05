import fetchOrderData from "../utils/shopify.js";
import fetchTrackingDetails from "../utils/shippo.js";

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const { orderNumber, email } = req.body;

  try {
    // Fetch order details from Shopify
    const orderData = await fetchOrderData(orderNumber, email);
    if (!orderData) {
      return res.status(404).send({ error: "Order not found." });
    }

    const trackingNumber = orderData.tracking_number;

    // Fetch tracking details from Shippo
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
