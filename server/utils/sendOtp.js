async function sendOTP(email, otp) {
  // Hackathon mode: replace with nodemailer transport if needed.
  console.log(`OTP for ${email}: ${otp}`);
}

module.exports = { sendOTP };
