const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOrderConfirmation = async (order, userEmail) => {
  const itemsList = order.orderItems
    .map((i) => `<li>${i.name} x${i.quantity} — ₹${i.price}</li>`)
    .join('');

  await transporter.sendMail({
    from: `"Bro Fusion" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmed #${order._id}`,
    html: `
      <h2>Thanks for your order!</h2>
      <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
      <ul>${itemsList}</ul>
      <p><strong>Total: ₹${order.totalPrice}</strong></p>
      <p>Payment: ${order.paymentMethod}</p>
      <p>We'll notify you when it's shipped. 🚀</p>
    `,
  });
};

exports.sendAdminOrderNotification = async (order, userName) => {
  const itemsList = order.orderItems
    .map((i) => `<li>${i.name} x${i.quantity} — ₹${i.price}</li>`)
    .join('');

  await transporter.sendMail({
    from: `"Bro Fusion System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛍️ New Order Received #${order._id}`,
    html: `
      <h2>New Order from ${userName}</h2>
      <p>Order ID: <strong>#${order._id}</strong></p>
      <ul>${itemsList}</ul>
      <p><strong>Total: ₹${order.totalPrice}</strong></p>
      <p>Shipping to: ${order.shippingAddress.name}, ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
    `,
  });
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"Bro Fusion" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password (valid for 10 minutes):</p>
      <a href="${resetUrl}" style="background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};
