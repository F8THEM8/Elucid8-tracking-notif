import fetchOrderData from "../utils/shopify.js";
import fetchTrackingDetails from "../utils/shippo.js";

// Fetch with timeout
export const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
};

export default async (req, res) => {
  // Add CORS headers to allow your frontend domain (elucid8-jewelry.com)
  res.setHeader("Access-Control-Allow-Origin", "https://elucid8-jewelry.com");  // Adjust this domain for production
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");  // Allow credentials like cookies or session

  // Handle preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();  // Respond to OPTIONS request for preflight check
  }

  // Handle POST request
  if (req.method === "POST") {
    const { orderNumber, email } = req.body;

    try {
      const orderData = await fetchOrderData(orderNumber, email);
      if (!orderData) {
        return res.status(404).send({ error: "Order not found." });
      }

      const trackingNumber = orderData.tracking_number;
      const trackingData = await fetchTrackingDetails(trackingNumber);

      res.status(200).json({
        trackingNumber,
        status: trackingData.tracking_status.status,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send({ error: "Internal server error. Please try again later." });
    }
  } else {
    res.status(405).send({ error: "Method not allowed" });
  }
};
