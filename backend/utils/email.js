const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const sendMail = async (options) => {
  try {
    const transporter = nodemailer.createTransport(
      sgTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY,
        },
      })
    );

    const mailOptions = {
      from: "mavoid@mavoid.com",
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    // console.log("Sending email with the following options:", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. to ${options.email}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email sending failed.");
  }
};

module.exports = sendMail;
