const sgMail = require('@sendgrid/mail')
const twilio = require('twilio')

const sendgridKey = process.env.SENDGRID_API_KEY
const twilioSid = process.env.TWILIO_ACCOUNT_SID
const twilioToken = process.env.TWILIO_AUTH_TOKEN
const twilioFrom = process.env.TWILIO_PHONE_NUMBER

if (sendgridKey) {
  sgMail.setApiKey(sendgridKey)
}

let twilioClient
if (twilioSid && twilioToken) {
  twilioClient = twilio(twilioSid, twilioToken)
}

const sendEmail = async (to, subject, html) => {
  if (!sendgridKey) {
    console.log('Email skipped:', subject, to)
    return
  }
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@eventsuite.dev',
    subject,
    html,
  })
}

const sendSMS = async (to, body) => {
  if (!twilioClient || !twilioFrom) {
    console.log('SMS skipped:', body, to)
    return
  }
  await twilioClient.messages.create({
    from: twilioFrom,
    to,
    body,
  })
}

const template = ({ title, body }) => `<div style="font-family: system-ui, sans-serif">
  <h2>${title}</h2>
  <p>${body}</p>
</div>`

const sendNotification = async ({ email, phone, title, message }) => {
  if (email) {
    await sendEmail(email, title, template({ title, body: message }))
  }
  if (phone) {
    await sendSMS(phone, `${title}: ${message}`)
  }
}

module.exports = sendNotification
