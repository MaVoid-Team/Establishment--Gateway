module.exports = (name, orderTitle) => `
    <p>Dear ${name},</p>
    <p>We regret to inform you that your order titled "<strong>${orderTitle}</strong>" has been rejected.</p>
    <p>If you have any questions about this decision, please contact our support team for further clarification.</p>
    <p>Thank you for your understanding.</p>
    <p>Best regards,<br>Order Management Team</p>
`;