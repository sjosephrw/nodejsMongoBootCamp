const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1. Create transporter
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD // generated ethereal password
        }
    });
    //2. Define the email options
    // send mail with defined transport object
    await transporter.sendMail({
        from: '"Admin 👻" <reset@natours.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject+' ✔', // Subject line
        text: options.message//, // plain text body
        //html: '<b>Hello world?</b>' // html body
    });


    // //3. Send the email
    // console.log('Message sent: %s', info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

}

module.exports = sendEmail;