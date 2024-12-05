import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set in Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const shippoPayload = req.body;
  const trackingNumber = shippoPayload.data.tracking_number;
  const status = shippoPayload.data.tracking_status?.status || "Unknown";
  const metadata = shippoPayload.data.metadata;
  const orderNumber = metadata.replace("Order ", ""); // Extract order number
  const customerEmail = await getEmailFromOrder(orderNumber); // See Step 4
  const customerName = await getNameFromOrder(orderNumber);

  const emailContent = {
    to: customerEmail,
    from: "no-reply@elucid8.com",
    subject: "Your Elucid8 Order Update",
    text: `Dear ${customerName},\n\nYour order #${orderNumber} has been updated.\nCurrent status: ${status}.\n\nThank you for choosing Elucid8!\nWarm regards,\nThe Elucid8 Team`,
  };

  try {
    await sgMail.send(emailContent);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Mock functions to fetch email and name from Shopify
async function getEmailFromOrder(orderNumber) {
  // Query Shopify API for order details using order number
  const response = await fetch(`https://your-shopify-store.myshopify.com/admin/api/2023-04/orders.json?name=${orderNumber}`, {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
    },
  });
  const data = await response.json();
  return data.orders[0]?.email;
}

async function getNameFromOrder(orderNumber) {
  const response = await fetch(`https://your-shopify-store.myshopify.com/admin/api/2023-04/orders.json?name=${orderNumber}`, {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
    },
  });
  const data = await response.json();
  return data.orders[0]?.customer?.first_name;
}
