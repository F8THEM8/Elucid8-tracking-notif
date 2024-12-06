const fetchOrderData = require("../utils/shopify.js");
const fetchTrackingDetails = require("../utils/shippo.js");

module.exports = async (req, res) => {
  // Set headers for CORS
  res.setHeader("Access-Control-Allow-Origin", "https://elucid8-jewelry.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { orderNumber, email } = req.body;

    try {
      const orderData = await fetchOrderData(orderNumber, email);

      if (!orderData) {
        return res.status(404).send({ error: "Order not found." });
      }

      const trackingNumber = orderData.trackingNumber;
      const trackingData = await fetchTrackingDetails(trackingNumber);

      res.status(200).json({
        orderNumber: orderData.orderName,
        email: orderData.email,
        fulfillmentStatus: orderData.fulfillmentStatus,
        trackingNumber,
        trackingStatus: trackingData.tracking_status.status,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send({ error: "Internal server error. Please try again later." });
    }
  } else {
    res.status(405).send({ error: "Method not allowed" });
  }
};
