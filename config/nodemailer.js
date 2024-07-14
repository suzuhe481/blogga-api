const nodemailer = require("nodemailer");
const issueJWT = require("../lib/jwtUtil").issueJWT;

// Configuration for sending emails with nodemailer.
module.exports.transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Creates an email to be sent to the given email address.
module.exports.createEmail = (user) => {
  console.log("creating email start");
  const userEmail = user.email;

  // Verification link which depends on DEV_MODE.
  const link =
    process.env.DEV_MODE === "true"
      ? process.env.DEV_VERIFY_URL
      : process.env.PROD_VERIFY_URL;

  const token = issueJWT(user); // Create a token to attach to link

  const emailTemplate = createEmailTemplate(link, token);

  return {
    from: process.env.GMAIL_EMAIL,
    to: userEmail,
    subject: "Blogga - Account Activation",
    text: "Activate your Blogga account",
    html: emailTemplate,
  };
};

// Creates the email template and attaches the link with JWT token.
function createEmailTemplate(link, token) {
  console.log("email template start");

  return `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
      #outlook a { padding:0; }
      body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
      table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
      img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
      p { display:block;margin:13px 0; }
    </style>
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <!--[if lte mso 11]>
    <style type="text/css">
      .mj-outlook-group-fix { width:100% !important; }
    </style>
    <![endif]-->
    
      <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Ubuntu:400,700" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
        <style type="text/css">
          @import url(https://fonts.googleapis.com/css?family=Ubuntu:400,700);
@import url(https://fonts.googleapis.com/css?family=Cabin:400,700);
        </style>
      <!--<![endif]-->

    
    
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
      }
    </style>
    <style media="screen and (min-width:480px)">
      .moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }
    </style>
    
  
    <style type="text/css">
    
    
    </style>
    <style type="text/css">
    .hide_on_mobile { display: none !important;} 
        @media only screen and (min-width: 480px) { .hide_on_mobile { display: block !important;} }
        .hide_section_on_mobile { display: none !important;} 
        @media only screen and (min-width: 480px) { 
            .hide_section_on_mobile { 
                display: table !important;
            } 

            div.hide_section_on_mobile { 
                display: block !important;
            }
        }
        .hide_on_desktop { display: block !important;} 
        @media only screen and (min-width: 480px) { .hide_on_desktop { display: none !important;} }
        .hide_section_on_desktop { 
            display: table !important;
            width: 100%;
        } 
        @media only screen and (min-width: 480px) { .hide_section_on_desktop { display: none !important;} }
        
          p, h1, h2, h3 {
              margin: 0px;
          }

          ul, li, ol {
            font-size: 11px;
            font-family: Ubuntu, Helvetica, Arial;
          }

          a {
              text-decoration: none;
              color: inherit;
          }

        @media only screen and (max-width:480px) {
            .mj-column-per-100 { width:100%!important; max-width:100%!important; }.mj-column-per-100 > .mj-column-per-100 { width:100%!important; max-width:100%!important; }
        }
    </style>
    
  </head>
  <body style="word-spacing:normal;background-color:#FFFFFF;">
    
    
      <div style="background-color:#FFFFFF;">
        
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#49a6e8;background-color:#49a6e8;width:100%;">
        <tbody>
          <tr>
            <td>
              
        
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#49a6e8" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    
        
      <div style="margin:0px auto;max-width:600px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:0px 0px 0px 0px;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
            
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        <tbody>
          
              <tr>
                <td style="font-size:0px;word-break:break-word;">
                  
      <div style="height:50px;line-height:50px;">&#8202;</div>
    
                </td>
              </tr>
            
              <tr>
                <td align="center" style="font-size:0px;padding:10px 20px 10px 20px;word-break:break-word;">
                  
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:center;color:#FFFFFF;"><h1 style="font-family: 'Cabin', sans-serif; font-size: 32px; color: #FFFFFF;">Thanks for joining Blogga!</h1></div>
    
                </td>
              </tr>
            
              <tr>
                <td style="font-size:0px;word-break:break-word;">
                  
      <div style="height:50px;line-height:50px;">&#8202;</div>
    
                </td>
              </tr>
            
        </tbody>
      </table>
    
      </div>
    
          <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
        
      <!--[if mso | IE]></td></tr></table><![endif]-->
    
      
            </td>
          </tr>
        </tbody>
      </table>
    
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td>
              
        
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    
        
      <div style="margin:0px auto;max-width:600px;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:35px 0px 35px 0px;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
            
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
        <tbody>
          
              <tr>
                <td align="left" style="font-size:0px;padding:13px 20px 13px 20px;word-break:break-word;">
                  
      <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;color:#000000;"><p style="font-family: Ubuntu, sans-serif; font-size: 11px;">In order to create and post on Blogga, you will need to verify your email, by clicking on the verification link below.</p>
<p style="font-family: Ubuntu, sans-serif; font-size: 11px;">&nbsp;</p>
<p style="font-family: Ubuntu, sans-serif; font-size: 11px;"><a href=${link}/${token} target="_blank" rel="noopener" style="color: #0000EE;">${link}/${token}</a></p>
<p style="font-family: Ubuntu, sans-serif; font-size: 11px;">&nbsp;</p>
<p style="font-family: Ubuntu, sans-serif; font-size: 11px;">Thank you</p></div>
    
                </td>
              </tr>
            
        </tbody>
      </table>
    
      </div>
    
          <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    
        
      <!--[if mso | IE]></td></tr></table><![endif]-->
    
      
            </td>
          </tr>
        </tbody>
      </table>
    
      </div>
    
  </body>
</html>
  `;

  return `<div>
      <p>Hello, this is an email</p> <b>Some bold text</b>
      <p>This link will expire in 10 minutes</p>
      <a href=${link}/${token}>Verify Account</a>
    </div>`;
}
