const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    // 1. Create a transporter
    let transporter;

    // Use ethereal or config settings
    if (process.env.EMAIL_USER === 'mockuser@ethereal.email') {
        // Create an ephemeral test account on Ethereal
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass  // generated ethereal password
            }
        });
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // 2. Define the email options
    const mailOptions = {
        from: '"Enterprise HR Portal" <noreply@isoftzone.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent: ${info.messageId}`);
    
    // In ethereal development, print url
    if (process.env.EMAIL_USER === 'mockuser@ethereal.email') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`Ethereal Email Preview URL: ${previewUrl}`);
        console.log(`[MOCK EMAIL SENT] Preview URL: ${previewUrl}`);
    }
    
    return info;
};

module.exports = sendEmail;
