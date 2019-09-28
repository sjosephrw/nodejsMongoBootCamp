//core modules
const path = require('path');

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    //constructor is the function that runs when a new obj. of this class is created
    constructor(user, url){//url for password reset
        this.to = user.email;
        this.firstName = user.name.split(' ')[0]; 
        this.url = url;
        this.from = `Joseph Wimalasuriya 👻 <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){

        if (process.env.NODE_ENV === 'production'){
            //if we are in production we will be using send grid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME, // generated ethereal user
                    pass: process.env.SENDGRID_PASSWORD // generated ethereal password
                }
            }); 
        }

        // create reusable transporter object using the default SMTP transport
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USERNAME, // generated ethereal user
                pass: process.env.EMAIL_PASSWORD // generated ethereal password
            }
        }); 
        
    }

    //send the Email
    async send(template, subject){

        //1. render html based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, { 
            firstName: this.firstName,
            url: this.url,
            subject    
        });
        //2. create transport and send email

        await this.newTransport().sendMail({
            from: this.from, // sender address
            to: this.to, // list of receivers
            subject: subject +' ✔', // Subject line
            text: htmlToText.fromString(html),//, // plain text body
            html: html // html body
        });
    }

    async sendWelcome(){
        //must await the function below
        await this.send('welcome', 'Welcome to the natours family!');
    }

    async sendPasswordReset(){
        //must await the function below
        await this.send('passwordReset', 'Your password reset token (valid for 10 minutes).');        
    }
}

// const sendEmail = async options => {
//     //1. Create transporter
//     // let testAccount = await nodemailer.createTestAccount();

//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         secure: false, // true for 465, false for other ports
//         auth: {
//             user: process.env.EMAIL_USERNAME, // generated ethereal user
//             pass: process.env.EMAIL_PASSWORD // generated ethereal password
//         }
//     });
//     //2. Define the email options
//     // send mail with defined transport object
//     await transporter.sendMail({
//         from: '"Admin 👻" <reset@natours.com>', // sender address
//         to: options.email, // list of receivers
//         subject: options.subject+' ✔', // Subject line
//         text: options.message//, // plain text body
//         //html: '<b>Hello world?</b>' // html body
//     });


//     // //3. Send the email
//     // console.log('Message sent: %s', info.messageId);
//     // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//     // // Preview only available when sending through an Ethereal account
//     // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//     // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

// }

// module.exports = sendEmail;