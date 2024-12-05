import fetchShopifyOrder from "../utils/shopify";
import fetchShippoTracking from "../utils/shippo";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://elucid8-jewelry.com"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { orderNumber, email } = req.body;

    try {
      // Fetch order data from Shopify
      const order = await fetchShopifyOrder(orderNumber, email);
      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      // Get tracking number from the order
      const trackingNumber = order.fulfillments[0]?.tracking_number;
      if (!trackingNumber) {
        return res.status(404).json({ error: "Tracking number not found." });
      }

      // Fetch tracking status from Shippo
      const trackingStatus = await fetchShippoTracking(trackingNumber);
      return res.status(200).json({ status: trackingStatus.status });
    } catch (error) {
      console.error("Error details:", error); // Log the full error
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
