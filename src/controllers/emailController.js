const nodemailer = require('nodemailer');
const db = require('../db');
require('dotenv').config();

exports.sendHotelBookingEmail = async (req, res) => {
  const { hotel_id, bookingData } = req.body;
  const itemId = bookingData.item_id; // Added item_id from front-end

  try {
    // 1. Fetch hotel contact email
    const contactResult = await db.query(
      'SELECT email FROM hotel_contacts WHERE hotel_id = $1 LIMIT 1',
      [hotel_id]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ message: 'No contact email found for this hotel. Please add a contact email in the Hotel Management page.' });
    }

    const hotelEmail = contactResult.rows[0].email;

    // 2. Setup nodemailer
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Prepare Meal Details
    let mealsHtml = 'None';
    if (bookingData.meals) {
      const parts = [];
      if (bookingData.meals.hasAbf) parts.push(`ABF (${bookingData.meals.abfDays || 0} days)`);
      if (bookingData.meals.hasLunch) parts.push(`Lunch (${bookingData.meals.lunchDays || 0} days)`);
      if (bookingData.meals.hasDinner) parts.push(`Dinner (${bookingData.meals.dinnerDays || 0} days)`);
      if (bookingData.meals.hasAllInclusive) parts.push(`All-Inclusive (${bookingData.meals.allInclusiveDays || 0} days)`);
      mealsHtml = parts.join(', ') || 'None';
    }

    // Generate Smart Links
    const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const confirmUrl = itemId ? `${baseUrl}/api/v1/emails/confirm-hotel/${itemId}` : '#';
    const rejectUrl = itemId ? `${baseUrl}/api/v1/emails/reject-hotel/${itemId}` : '#';

    // 3. Create HTML template (Professional Design)
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: #FF5E00; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">BOOKING REQUEST</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ref: ${bookingData.bookingRef || 'NEW'}</p>
        </div>
        
        <div style="padding: 30px; color: #444;">
          <p style="font-size: 16px;">Dear <strong>${bookingData.hotel_name} Reservation Team</strong>,</p>
          <p>We are pleased to request a reservation with the following details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 25px; border: 1px solid #f0f0f0;">
            <tr style="background-color: #fcfcfc;">
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #8F8071; width: 140px;">Check-in</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${bookingData.checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #8F8071;">Check-out</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${bookingData.checkOut} (${bookingData.nights} Nights)</td>
            </tr>
            <tr style="background-color: #fcfcfc;">
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #8F8071;">Room Type</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${bookingData.roomType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #8F8071;">Promotion</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${bookingData.promotion || '-'}</td>
            </tr>
            <tr style="background-color: #fcfcfc;">
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; color: #8F8071;">Meal Plan</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${mealsHtml}</td>
            </tr>
          </table>

          ${bookingData.notes ? `
          <div style="margin-top: 25px; padding: 15px; background-color: #fff9f5; border-left: 4px solid #FF5E00; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #FF5E00; font-size: 14px;">Special Requests:</p>
            <p style="margin: 5px 0 0 0; font-style: italic;">${bookingData.notes}</p>
          </div>
          ` : ''}

          <!-- CALL TO ACTION BUTTONS -->
          ${itemId ? `
          <div style="margin-top: 35px; text-align: center;">
            <a href="${confirmUrl}" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; box-shadow: 0 4px 6px rgba(40,167,69,0.2);">CONFIRM BOOKING</a>
            <a href="${rejectUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 6px rgba(220,53,69,0.2);">NOT AVAILABLE</a>
          </div>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">By clicking these buttons, the status will update in our system automatically.</p>
          ` : `
          <p style="margin-top: 30px;">Please reply to this email to confirm the availability. Thank you.</p>
          `}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #888;">
            <p style="margin: 0;">Kind Regards,</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; color: #444; font-size: 15px;">Thailandia Operations Team</p>
          </div>
        </div>
      </div>
    `;

    // 4. Send email
    let info = await transporter.sendMail({
      from: `"Thailandia Booking" <${process.env.SMTP_FROM || 'booking@thailandia.com'}>`,
      to: hotelEmail,
      subject: `Booking Request [${bookingData.bookingRef || 'NEW'}] - ${bookingData.hotel_name}`,
      html: htmlContent,
    });

    res.json({
      message: 'Email sent successfully!',
      messageId: info.messageId,
      previewUrl: process.env.SMTP_USER ? null : nodemailer.getTestMessageUrl(info),
      recipient: hotelEmail
    });

  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ message: 'Error sending email: ' + err.message });
  }
};

// --- NEW HANDLERS FOR CONFIRMATION/REJECTION ---

exports.confirmHotelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE hotel_trip_items SET booking_status = 'Confirmed', booking_remark = 'Hotel confirmed via email link' WHERE id::text = $1",
      [id]
    );
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #28a745;">Booking Confirmed!</h1>
        <p>Thank you for confirming the reservation. Our team has been notified.</p>
        <p style="color: #666;">Thailandia Trading & Traveling</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send('Error updating booking status.');
  }
};

exports.showRejectForm = async (req, res) => {
  const { id } = req.params;
  res.send(`
    <div style="font-family: sans-serif; max-width: 500px; margin: 100px auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #dc3545; margin-top: 0;">Report Unavailability</h2>
      <p>Please provide a reason why this booking cannot be confirmed:</p>
      <form action="/api/v1/emails/reject-hotel/${id}" method="POST">
        <textarea name="remark" style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" placeholder="e.g., Hotel is fully booked, maintenance, etc." required></textarea>
        <button type="submit" style="margin-top: 20px; width: 100%; padding: 12px; background-color: #dc3545; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">SUBMIT REJECTION</button>
      </form>
    </div>
  `);
};

exports.submitRejection = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  try {
    await db.query(
      "UPDATE hotel_trip_items SET booking_status = 'Rejected', booking_remark = $1 WHERE id::text = $2",
      [remark, id]
    );
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #dc3545;">Response Received</h1>
        <p>Thank you for your feedback. We will look for alternative options.</p>
        <p style="color: #666;">Thailandia Trading & Traveling</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send('Error updating booking status.');
  }
};
