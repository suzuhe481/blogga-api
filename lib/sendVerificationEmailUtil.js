const { transporter, createEmail } = require("../config/nodemailer");

/*
transporter: The nodemailer function to send the email.
createEmail: Function to create email template using user information.
*/

// Sends the verification email using nodemailer.
module.exports.sendVerificationEmail = (user) => {
  const mailData = createEmail(user);

  // Sending verification email.
  return transporter
    .sendMail(mailData)
    .then(() => {
      console.log(`Verification email sent to: ${user.email}`);

      return {
        success: true,
        message: `Verification email sent to: ${user.email}`,
      };
    })
    .catch((err) => {
      return {
        error: true,
        message: err,
      };
    });
};
