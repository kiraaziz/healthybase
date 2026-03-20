const sendLoginOTP = (code: string, emailLow: string) => {
  return (`<table role="presentation" style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: #f3f3f3;">
    <style>
      br { display: block !important; height: 0 !important; line-height: 0 !important; }
    </style>
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 20px 0px 0px;">
                  <div style="padding: 20px; background-color: #ffffff; border-radius: 8px;">
                    <div style="color: #000000; text-align: left;">
                      <h1 style="margin: -1rem 0; color: #72e3ad;">${code}</h1>
                      <p style="padding: 0px">Use this code to finish your login</p>
                      <p style="padding-bottom: -5px"><a href="${process.env.APP_URL}/app" target="_blank" style="padding: 12px 24px; border-radius: 4px; color: #000000; background: #72e3ad;display: inline-block;margin: 0.5rem 0;">Go to Heathy Base</a></p>
                      <p>If you didn’t ask to login with this address, you can ignore this email.</p>
                      <p>Thanks,<br>Heathy Base Team</p>
                    </div>
                  </div>
                  <div style="padding: 0px; color: #999999; text-align: center; font-size: 13px;">
                    <p style="padding-bottom: 0px; margin: 0;">
                      &copy; ${new Date().getFullYear()} Heathy Base. All rights reserved.
                    </p>
                    <p style="margin: 0;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  `)
}

const sendMessage = (title: any, text: any, link: any) => {
  return (`<table role="presentation" style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: #f3f3f3;">
    <style>
      br { display: block !important; height: 0 !important; line-height: 0 !important; }
    </style>
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 20px 0px 0px;">
                  <div style="padding: 20px; background-color: #ffffff; border-radius: 8px;">
                    <div style="color: #000000; text-align: left;">
                      <h1 style="margin: -1rem 0; color: #72e3ad;">${title}</h1>
                      <p style="padding: 0px">${text}</p>
                      <p style="padding-bottom: -5px"><a href="${process.env.APP_URL}/app/${link}" target="_blank" style="padding: 12px 24px; border-radius: 4px; color: #000000; background: #72e3ad;display: inline-block;margin: 0.5rem 0;">Go to Heathy Base</a></p>
                      <p>If you didn’t ask to login with this address, you can ignore this email.</p>
                      <p>Thanks,<br>Heathy Base Team</p>
                    </div>
                  </div>
                  <div style="padding: 0px; color: #999999; text-align: center; font-size: 13px;">
                    <p style="padding-bottom: 0px; margin: 0;">
                      &copy; ${new Date().getFullYear()} Heathy Base. All rights reserved.
                    </p>
                    <p style="margin: 0;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  `)
}


export { sendLoginOTP, sendMessage }