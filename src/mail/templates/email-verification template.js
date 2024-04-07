import { config } from "../../configs/config.js";


import { Resend } from "resend";


const resend = new Resend(config.get('resendApiKey'));

const emaiVerification = async (email, subject, url) => {
  const res = await resend.emails.send({
    from: "mail@codedefender.in",
    to: email,
    subject: subject,
    html: `<!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="UTF-8">
      <title>OTP Verification Email</title>
      <style>
        body {
          background-color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 16px;
          line-height: 1.4;
          color: #333333;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
    
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
    
        .message {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
        }
    
        .body {
          font-size: 16px;
          margin-bottom: 20px;
        }
    
        .cta {
          display: inline-block;
          padding: 10px 20px;
          background-color: #FFD60A;
          color: #000000;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          margin-top: 20px;
        }
    
        .support {
          font-size: 14px;
          color: #999999;
          margin-top: 20px;
        }
    
        .highlight {
          font-weight: bold;
        }
        .button-link {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff; /* Blue button color */
          color: white; /* Light text color */
          text-align: center;
          text-decoration: none;
          font-size: 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s;
        }
      
        .button-link:hover {
          background-color: #0056b3; /* Darker blue on hover */
        }
         a[href] {
          color: white;
      }
        
       
      </style>
    
    </head>
    
    <body>
      <div class="container">

        <div class="message">Email Verification</div>
        <div class="body">
          <p>Dear User,</p>
          <p>Thank you for registering with us. To complete your registration, please use the following Link
           to verify your account:</p>
          <a href=${url} class="button-link" style="color:white;">Verify</a>
          <p>This Link is valid for 1 hour. If you did not request this verification, please disregard this email.
          Once your account is verified, you will have access to our platform and its features.</p>
        </div>
        
      </div>
    </body>
    
    </html>`,
  });
  return res;
};

export { emaiVerification };


