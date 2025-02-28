export const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
};

export const sendSMS = async (phone, message) => {
  console.log(`Sending SMS to ${phone}: ${message}`);
  // Implement SMS API here (e.g., Twilio, Firebase)
};
