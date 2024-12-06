import fetchOrderData from "../utils/shopify.js";
import fetchTrackingDetails from "../utils/shippo.js";

// Fetch with timeout and retry logic
export const fetchWithTimeoutAndRetry = async (url, options, timeout = 20000, retries = 3) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://elucid8-jewelry.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    res.status(200).send({ message: "GET request received. Please use POST to submit data." });
  } else if (req.method === "POST") {
    const { orderNumber, email } = req.body;

    try {
      const orderData = await fetchOrderData(orderNumber, email);
      if (!orderData) {
        return res.status(404).send({ error: "Order not found." });
      }
      } catch (error) {
  console.error("Error fetching data:", error);
  res.status(500).send({ error: "Internal server error. Please try again later." });
}

      const trackingNumber = orderData.tracking_number;
      const trackingData = await fetchWithTimeoutAndRetry(`https://api.goshippo.com/tracks/${trackingNumber}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

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
