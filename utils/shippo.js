const fetchTrackingDetails = async (trackingNumber) => {
  const response = await fetch("https://api.goshippo.com/tracks/", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      carrier: "yunexpress", // Update carrier as needed
      tracking_number: trackingNumber,
    }),
  });

  return response.json();
};

export default fetchTrackingDetails;
