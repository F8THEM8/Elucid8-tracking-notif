const fetch = require("node-fetch");

const fetchTrackingDetails = async (trackingNumber) => {
  if (!trackingNumber) {
    throw new Error("Tracking number is required.");
  }

  try {
    const response = await fetch("https://api.goshippo.com/tracks/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`, // Access environment variable
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrier: "yunexpress", // Update carrier if necessary
        tracking_number: trackingNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shippo API Error:", errorText);
      throw new Error(`Shippo API request failed with status ${response.status}`);
    }

    const trackingData = await response.json();

    if (!trackingData || !trackingData.tracking_status) {
      throw new Error("Tracking data is incomplete or unavailable.");
    }

    return trackingData;
  } catch (error) {
    console.error("Error fetching tracking details:", error.message);
    throw new Error("Failed to fetch tracking details from Shippo.");
  }
};

module.exports = fetchTrackingDetails;
