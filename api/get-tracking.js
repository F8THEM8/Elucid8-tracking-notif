import fetchShopifyOrder from "../utils/shopify";
import fetchShippoTracking from "../utils/shippo";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://7r4f3s-11.myshopify.com"); // Replace with your Shopify store URL
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
      console.error("Error fetching tracking info:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
