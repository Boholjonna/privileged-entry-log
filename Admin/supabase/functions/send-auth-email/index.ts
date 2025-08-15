import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, authCode } = await req.json()

    // You can use any email service here. For this example, I'll use a simple approach
    // In production, you might want to use services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Or Supabase's built-in email service if you have it configured

    // For now, we'll simulate sending an email
    // Replace this with your actual email service implementation
    const emailContent = `
      <html>
        <body>
          <h2>Admin Authentication Code</h2>
          <p>Your authentication code is: <strong>${authCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </body>
      </html>
    `

    // Example using a hypothetical email service
    // const emailResponse = await fetch('https://your-email-service.com/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${Deno.env.get('EMAIL_SERVICE_API_KEY')}`
    //   },
    //   body: JSON.stringify({
    //     to: to,
    //     subject: subject,
    //     html: emailContent
    //   })
    // })

    // For now, we'll just log the email details
    console.log(`Email would be sent to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Auth Code: ${authCode}`)

    return new Response(
      JSON.stringify({ 
        message: 'Authentication code sent successfully',
        authCode: authCode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
