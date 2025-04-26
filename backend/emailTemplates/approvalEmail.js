module.exports = (name, orderTitle) => `
  <p>Dear ${name},</p>
  <p>You have a new order titled "<strong>${orderTitle}</strong>" awaiting your approval.</p>
  <p>Please log in to your dashboard to review and take the necessary action.</p>
  <p>Thank you for your prompt attention to this matter!</p>
  <p>Best regards,<br>Order Management Team</p>
`;