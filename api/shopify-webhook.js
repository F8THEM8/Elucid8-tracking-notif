export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify Shopify webhook
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET; // Set in Vercel dashboard
  const generatedHmac = crypto
    .createHmac("sha256", shopifySecret)
    .update(req.rawBody, "utf8")
    .digest("base64");

  if (hmac !== generatedHmac) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const order = req.body; // Shopify sends the order details here
  const trackingNumber = order.fulfillments[0]?.tracking_number;
  const carrier = order.fulfillments[0]?.tracking_company;
  const customerEmail = order.email;
  const customerName = order.customer.first_name;
  const orderNumber = order.name;

  // Register tracking number with Shippo
  if (trackingNumber && carrier) {
    await fetch("https://api.goshippo.com/tracks/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`, // Set in Vercel
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        carrier,
        tracking_number: trackingNumber,
        metadata: `Order ${orderNumber}`,
      }),
    });
  }

  res.status(200).json({ success: true });
}
