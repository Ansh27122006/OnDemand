const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Shared HTML wrapper ────────────────────────────────────────────────────

const htmlWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff;border-radius:8px;overflow:hidden;
                 box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a73e8;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                         letter-spacing:0.5px;">OnDemand</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#333333;font-size:15px;line-height:1.7;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f6f9;padding:20px 40px;
                       border-top:1px solid #e0e0e0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888888;">
                © ${new Date().getFullYear()} OnDemand. All rights reserved.<br/>
                If you have questions, contact our support team.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sectionHeading = (text) =>
  `<h2 style="color:#1a73e8;font-size:18px;margin:0 0 16px 0;">${text}</h2>`;

const paragraph = (text) => `<p style="margin:0 0 12px 0;">${text}</p>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;"/>`;

const badge = (text) =>
  `<span style="display:inline-block;background-color:#e8f0fe;color:#1a73e8;
               padding:4px 12px;border-radius:20px;font-size:13px;
               font-weight:600;">${text}</span>`;

// ─── 1. Order Confirmation ───────────────────────────────────────────────────

const sendOrderConfirmation = async ({
  customerEmail,
  customerName,
  orderId,
  items,
  totalAmount,
}) => {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${
          item.name
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${
          item.quantity
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">
          Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`
    )
    .join("");

  const body = `
    ${sectionHeading("Order Confirmed!")}
    ${paragraph(
      `Hi <strong>${customerName}</strong>, thank you for your order! We've received it and it's being processed.`
    )}
    ${paragraph(`Order ID: ${badge("#" + orderId)}`)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid #e0e0e0;border-radius:6px;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background-color:#f4f6f9;">
          <th style="padding:10px 12px;text-align:left;color:#555;font-weight:600;">Item</th>
          <th style="padding:10px 12px;text-align:center;color:#555;font-weight:600;">Qty</th>
          <th style="padding:10px 12px;text-align:right;color:#555;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background-color:#f4f6f9;">
          <td colspan="2" style="padding:12px;font-weight:700;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:700;color:#1a73e8;">
            Rs. ${Number(totalAmount).toLocaleString("en-IN")}
          </td>
        </tr>
      </tfoot>
    </table>
    ${divider()}
    ${paragraph(
      "We'll notify you as soon as your order is on its way. Thank you for shopping with <strong>OnDemand</strong>!"
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Order Confirmed — OnDemand",
      html: htmlWrapper("Order Confirmed — OnDemand", body),
    });
  } catch (err) {
    console.error("[emailService] sendOrderConfirmation failed:", err.message);
  }
};

// ─── 2. Order Status Update ──────────────────────────────────────────────────

const sendOrderStatusUpdate = async ({
  customerEmail,
  customerName,
  orderId,
  status,
  items,
  totalAmount,
}) => {
  const itemRows = (items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${
          item.name
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${
          item.quantity
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">
          Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`
    )
    .join("");

  const itemsTable =
    items && items.length > 0
      ? `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid #e0e0e0;border-radius:6px;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background-color:#f4f6f9;">
          <th style="padding:10px 12px;text-align:left;color:#555;font-weight:600;">Item</th>
          <th style="padding:10px 12px;text-align:center;color:#555;font-weight:600;">Qty</th>
          <th style="padding:10px 12px;text-align:right;color:#555;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background-color:#f4f6f9;">
          <td colspan="2" style="padding:12px;font-weight:700;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:700;color:#1a73e8;">
            Rs. ${Number(totalAmount).toLocaleString("en-IN")}
          </td>
        </tr>
      </tfoot>
    </table>
    ${divider()}
  `
      : "";

  const body = `
    ${sectionHeading("Order Status Update")}
    ${paragraph(
      `Hi <strong>${customerName}</strong>, here's the latest update on your order.`
    )}
    ${paragraph(`Order ID: ${badge("#" + orderId)}`)}
    ${paragraph(`Status: ${badge(status)}`)}
    ${divider()}
    ${itemsTable}
    ${paragraph(
      "If you have any questions about your order, please reach out to our support team and we'll be happy to help."
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Order Update — OnDemand",
      html: htmlWrapper("Order Update — OnDemand", body),
    });
  } catch (err) {
    console.error("[emailService] sendOrderStatusUpdate failed:", err.message);
  }
};

// ─── 3. Booking Confirmation ─────────────────────────────────────────────────

const sendBookingConfirmation = async ({
  customerEmail,
  customerName,
  bookingId,
  serviceName,
  scheduledDate,
  totalAmount,
}) => {
  const formattedDate = new Date(scheduledDate).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    ${sectionHeading("Booking Confirmed!")}
    ${paragraph(
      `Hi <strong>${customerName}</strong>, your booking has been confirmed. Here are your details:`
    )}
    ${paragraph(`Booking ID: ${badge("#" + bookingId)}`)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:#555;width:40%;">Service</td>
        <td style="padding:8px 0;font-weight:600;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;">Scheduled Date</td>
        <td style="padding:8px 0;font-weight:600;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;">Amount</td>
        <td style="padding:8px 0;font-weight:600;color:#1a73e8;">
          Rs. ${Number(totalAmount).toLocaleString("en-IN")}
        </td>
      </tr>
    </table>
    ${divider()}
    ${paragraph(
      "Please make sure you're available at the scheduled time. We look forward to serving you!"
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Booking Confirmed — OnDemand",
      html: htmlWrapper("Booking Confirmed — OnDemand", body),
    });
  } catch (err) {
    console.error(
      "[emailService] sendBookingConfirmation failed:",
      err.message
    );
  }
};

// ─── 4. Booking Status Update ────────────────────────────────────────────────

const sendBookingStatusUpdate = async ({
  customerEmail,
  customerName,
  bookingId,
  serviceName,
  status,
}) => {
  const body = `
    ${sectionHeading("Booking Status Update")}
    ${paragraph(
      `Hi <strong>${customerName}</strong>, there's an update on your booking.`
    )}
    ${paragraph(`Booking ID: ${badge("#" + bookingId)}`)}
    ${paragraph(`Service: <strong>${serviceName}</strong>`)}
    ${divider()}
    ${paragraph(`Your booking status has been updated to: ${badge(status)}`)}
    ${divider()}
    ${paragraph(
      "If you have any questions or concerns, please don't hesitate to contact our support team."
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Booking Update — OnDemand",
      html: htmlWrapper("Booking Update — OnDemand", body),
    });
  } catch (err) {
    console.error(
      "[emailService] sendBookingStatusUpdate failed:",
      err.message
    );
  }
};

// ─── 5. Vendor Approved ──────────────────────────────────────────────────────

const sendVendorApproved = async ({ vendorEmail, vendorName, storeName }) => {
  const body = `
    ${sectionHeading("🎉 Congratulations! Your Store is Approved!")}
    ${paragraph(`Hi <strong>${vendorName}</strong>, great news!`)}
    ${paragraph(
      `Your store <strong>${storeName}</strong> has been reviewed and officially approved on <strong>OnDemand</strong>.`
    )}
    ${divider()}
    <p style="margin:0 0 12px 0;">Here's what you can do now:</p>
    <ul style="margin:0 0 16px 0;padding-left:20px;line-height:1.9;">
      <li>Add products to your store catalogue</li>
      <li>List services you offer to customers</li>
      <li>Manage your orders and bookings from your vendor dashboard</li>
    </ul>
    ${divider()}
    ${paragraph(
      "Welcome aboard! We're excited to have <strong>" +
        storeName +
        "</strong> on OnDemand. Let's grow together!"
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: "Your Store is Approved! — OnDemand",
      html: htmlWrapper("Your Store is Approved! — OnDemand", body),
    });
  } catch (err) {
    console.error("[emailService] sendVendorApproved failed:", err.message);
  }
};

// ─── 6. Vendor Rejected ──────────────────────────────────────────────────────

const sendVendorRejected = async ({ vendorEmail, vendorName, storeName }) => {
  const body = `
    ${sectionHeading("Store Application Update")}
    ${paragraph(
      `Hi <strong>${vendorName}</strong>, thank you for your interest in joining OnDemand.`
    )}
    ${paragraph(
      `After reviewing your application for <strong>${storeName}</strong>, we're sorry to inform you that we're unable to approve it at this time.`
    )}
    ${divider()}
    ${paragraph(
      "This could be due to incomplete information, documentation issues, or other policy-related reasons."
    )}
    ${paragraph(
      "We encourage you to <strong>contact our support team</strong> for more details about the decision and to understand what steps you can take to reapply."
    )}
    ${divider()}
    ${paragraph(
      "We appreciate your effort and hope to work with you in the future."
    )}
  `;

  try {
    await transporter.sendMail({
      from: `"OnDemand" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: "Store Application Update — OnDemand",
      html: htmlWrapper("Store Application Update — OnDemand", body),
    });
  } catch (err) {
    console.error("[emailService] sendVendorRejected failed:", err.message);
  }
};

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
  sendVendorApproved,
  sendVendorRejected,
};
