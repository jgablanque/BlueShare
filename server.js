const nodemailer = require('nodemailer');

// 1. Configure Email Transporter (using environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. 'notifications@blueshare.ph'
    pass: process.env.EMAIL_PASS  // App Password generated in Google Account
  }
});

// 2. Helper function to send rental request emails
async function sendBookingNotifications(booking) {
  const { contractId, item, borrowerEmail, pickupZone, totalPaid } = booking;

  // A. Email to LENDER (New Request Alert)
  const lenderMailOptions = {
    from: '"BlueShare Hub" <no-reply@blueshare.ph>',
    to: item.lenderEmail,
    subject: `🔔 New Rental Request: ${item.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0052FF;">New Equipment Rental Request!</h2>
        <p>Student <strong>${borrowerEmail}</strong> has requested to borrow your <strong>${item.title}</strong>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0;"/>
        <p><strong>Contract ID:</strong> ${contractId}</p>
        <p><strong>Safe Meetup Zone:</strong> ${pickupZone}</p>
        <p><strong>Total Amount Paid:</strong> ₱${totalPaid}</p>
        <p style="color: #64748B; font-size: 13px;">Please log into your BlueShare profile to verify the payment receipt and confirm handover timing.</p>
      </div>
    `
  };

  // B. Email to BORROWER (Booking Confirmation)
  const borrowerMailOptions = {
    from: '"BlueShare Hub" <no-reply@blueshare.ph>',
    to: borrowerEmail,
    subject: `✅ Booking Confirmed: ${item.title} (${contractId})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0052FF;">Rental Request Received</h2>
        <p>Your request for <strong>${item.title}</strong> has been logged.</p>
        <p><strong>Safe Zone Handover:</strong> ${pickupZone}</p>
        <p><strong>Digital Contract ID:</strong> ${contractId}</p>
        <p style="background: #FFFBEB; padding: 10px; border-radius: 6px; color: #92400E; font-size: 13px;">
          🔒 <strong>AdDU Safety Protocol:</strong> Remember to log baseline photos of the equipment condition during handover at the safe zone.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(lenderMailOptions);
    await transporter.sendMail(borrowerMailOptions);
    console.log(`[EMAIL]: Notifications sent for Contract ${contractId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR]: Failed to send notifications:`, err);
  }
}
