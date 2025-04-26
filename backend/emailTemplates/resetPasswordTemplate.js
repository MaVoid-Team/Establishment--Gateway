// Function to generate the reset password email HTML
const resetPasswordTemplate = (resetURL) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #333;">Forgot your password?</h2>
      <p style="font-size: 16px; color: #555;">
        Please click the button below to reset your password. This link will expire in 10 minutes.
      </p>
      <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #C19E7C; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p style="font-size: 12px; color: #888; margin-top: 20px;">
        If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  `;
};

module.exports = resetPasswordTemplate;
