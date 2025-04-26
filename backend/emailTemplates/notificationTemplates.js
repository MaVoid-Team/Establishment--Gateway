function orderApprovalNotificationTemplate(employeeName, orderTitle, fromName) {
  return `
      Hello ${employeeName},
      Your order "${orderTitle}" has been approved by ${fromName}.
    `;
}

function adminOrderFinalizedNotificationTemplate(adminName, orderTitle) {
  return `
      Hello ${adminName},
      An order titled "${orderTitle}" has been finalized.
    `;
}

function monetaryApprovalNotificationTemplate(
  employeeName,
  orderTitle,
  fromName
) {
  return `
      Hello ${employeeName},
      Your order "${orderTitle}" requires monetary approval from ${fromName}.
    `;
}

module.exports = {
  orderApprovalNotificationTemplate,
  adminOrderFinalizedNotificationTemplate,
  monetaryApprovalNotificationTemplate,
};
