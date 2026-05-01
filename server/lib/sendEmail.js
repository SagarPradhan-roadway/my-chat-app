import nodemailer from "nodemailer";

export const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // ✅ IMPORTANT
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });


  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email, // ✅ user email (dynamic)
    subject: "Password Reset OTP",
    text: `Your OTP is: ${otp}`
  });
    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASS);
};