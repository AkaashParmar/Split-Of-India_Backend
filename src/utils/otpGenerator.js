// utils/otpGenerator.js
const generateOTP = () => {
  return (Math.floor(1000 + Math.random() * 9000)).toString();  // 4-digit numeric string
};

module.exports = generateOTP;
