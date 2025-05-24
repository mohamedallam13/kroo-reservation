(function (root, factory) {
  root.EMAIL_SENDING = factory();
})(this, function () {
  
  const LIVE = false
  const testEmail = 'mohamedallam.tu@gmail.com'


  /**
 * Generate HTML email content for booking confirmation
 * All CSS is inline for email client compatibility
 * 
 * @param {Object} bookingData - Booking data to include in the email
 * @returns {string} HTML email content
 */
  function generateBookingConfirmationEmail(bookingData) {
    // Extract booking data
    const {
      resourceName,
      date,
      startTime,
      endTime,
      price,
      paymentMethod,
      reference,
      partialPayment,
      userDetails
    } = bookingData;

    // Format date
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Format time
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const formattedTimeRange = `${formattedStartTime} - ${formattedEndTime}`;

    // Calculate duration
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);
    const durationHours = (endMinutes - startMinutes) / 60;
    const formattedDuration = formatDuration(durationHours);

    // Generate unique QR code URL
    // In a real implementation, this would generate an actual QR code image URL
    const qrCodeUrl = `https://yourdomain.com/qr-codes/${reference}.png`;

    // Format payment method name
    const formattedPaymentMethod = capitalizeFirstLetter(paymentMethod);

    // Generate email template and replace placeholders
    let emailTemplate = BOOKING_CONFIRMATION_EMAIL_TEMPLATE;

    // Replace basic placeholders
    emailTemplate = emailTemplate
      .replace(/{{BOOKING_REFERENCE}}/g, reference)
      .replace(/{{RESOURCE_NAME}}/g, resourceName)
      .replace(/{{FORMATTED_DATE}}/g, formattedDate)
      .replace(/{{FORMATTED_TIME}}/g, formattedTimeRange)
      .replace(/{{DURATION}}/g, formattedDuration)
      .replace(/{{PRICE}}/g, price.toFixed(2))
      .replace(/{{PAYMENT_METHOD}}/g, formattedPaymentMethod)
      .replace(/{{QR_CODE_URL}}/g, qrCodeUrl);

    // Handle partial payment section
    if (partialPayment) {
      // Replace partial payment placeholders
      emailTemplate = emailTemplate
        .replace(/{{PAID_AMOUNT}}/g, partialPayment.paid.toFixed(2))
        .replace(/{{REMAINING_AMOUNT}}/g, partialPayment.remaining.toFixed(2));

      // Keep the partial payment section
      emailTemplate = emailTemplate
        .replace(/<!-- BEGIN:PARTIAL_PAYMENT -->/g, '')
        .replace(/<!-- END:PARTIAL_PAYMENT -->/g, '');
    } else {
      // Remove the partial payment section entirely
      emailTemplate = emailTemplate
        .replace(/<!-- BEGIN:PARTIAL_PAYMENT -->[\s\S]*?<!-- END:PARTIAL_PAYMENT -->/g, '');
    }

    // Add user-specific greeting if user details are available
    if (userDetails && userDetails.name) {
      // Add personalized greeting after the subtitle
      const personalizedGreeting = `<p style="margin: 15px 0 0 0; font-size: 16px; color: #64748b;">Hello ${userDetails.name},</p>`;
      emailTemplate = emailTemplate.replace(
        `<p style="margin: 0; font-size: 16px; color: #64748b;">Your reservation has been successfully booked</p>`,
        `<p style="margin: 0; font-size: 16px; color: #64748b;">Your reservation has been successfully booked</p>${personalizedGreeting}`
      );
    }

    return emailTemplate;
  }

  /**
   * Convert HH:MM time to minutes since midnight
   * @param {string} timeString - Time in HH:MM format
   * @returns {number} Minutes since midnight
   */
  function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format time from HH:MM to 12-hour format
   * @param {string} timeString - Time in HH:MM format
   * @returns {string} Formatted time
   */
  function formatTime(timeString) {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':').map(Number);
    const hour = parseInt(hours);

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}${minutes !== 0 ? ':' + minutes.toString().padStart(2, '0') : ''} ${suffix}`;
  }

  /**
   * Format duration in hours to a readable string
   * @param {number} hours - Duration in hours
   * @returns {string} Formatted duration
   */
  function formatDuration(hours) {
    if (hours === 1) {
      return "1 hour";
    } else if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);

      if (minutes === 0) {
        return `${wholeHours} hour${wholeHours > 1 ? 's' : ''}`;
      } else {
        return `${wholeHours} hour${wholeHours > 1 ? 's' : ''} ${minutes} min`;
      }
    }
  }

  /**
   * Capitalize the first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // The email template HTML string
  const BOOKING_CONFIRMATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - KROO Reservations</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 30px 0;">
        <!-- Email Content -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 30px 30px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <img src="https://yourdomain.com/logo.png" alt="KROO Reservations" width="120" style="display: block; margin-bottom: 20px;">
                    <!-- Success Icon -->
                    <div style="color: #f59e0b; font-size: 60px; margin-bottom: 20px;">✓</div>
                    <!-- Title -->
                    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1e293b;">Booking Confirmed</h1>
                    <!-- Subtitle -->
                    <p style="margin: 0; font-size: 16px; color: #64748b;">Your reservation has been successfully booked</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Booking Reference -->
          <tr>
            <td align="center" style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" align="left" style="color: #92400e; font-weight: 500; font-size: 16px;">
                          Booking Reference:
                        </td>
                        <td width="50%" align="right" style="color: #d97706; font-weight: bold; font-size: 16px; font-family: monospace;">
                          {{BOOKING_REFERENCE}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Resource -->
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 6px;">
                          <span style="color: #f59e0b; font-size: 16px; margin-right: 8px;">🏢</span>
                          <span style="color: #64748b; font-size: 14px; font-weight: 500;">Resource</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #1e293b; font-size: 16px; font-weight: 500; padding-bottom: 10px;">
                          {{RESOURCE_NAME}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Date -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 6px;">
                          <span style="color: #f59e0b; font-size: 16px; margin-right: 8px;">📅</span>
                          <span style="color: #64748b; font-size: 14px; font-weight: 500;">Date</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #1e293b; font-size: 16px; font-weight: 500; padding-bottom: 10px;">
                          {{FORMATTED_DATE}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Time -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 6px;">
                          <span style="color: #f59e0b; font-size: 16px; margin-right: 8px;">🕒</span>
                          <span style="color: #64748b; font-size: 14px; font-weight: 500;">Time</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #1e293b; font-size: 16px; font-weight: 500; padding-bottom: 10px;">
                          {{FORMATTED_TIME}} ({{DURATION}})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Payment -->
                <tr>
                  <td style="padding: 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 6px;">
                          <span style="color: #f59e0b; font-size: 16px; margin-right: 8px;">💰</span>
                          <span style="color: #64748b; font-size: 14px; font-weight: 500;">Payment</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <!-- Amount -->
                            <tr>
                              <td width="40%" style="color: #64748b; padding: 5px 0;">Amount:</td>
                              <td width="60%" style="color: #1e293b; font-weight: 500; text-align: right; padding: 5px 0;">
                                EGP {{PRICE}}
                              </td>
                            </tr>
                            
                            <!-- Payment Method -->
                            <tr>
                              <td width="40%" style="color: #64748b; padding: 5px 0;">Method:</td>
                              <td width="60%" style="color: #1e293b; font-weight: 500; text-align: right; padding: 5px 0;">
                                {{PAYMENT_METHOD}}
                              </td>
                            </tr>
                            
                            <!-- BEGIN:PARTIAL_PAYMENT -->
                            <!-- Payment Status -->
                            <tr>
                              <td colspan="2" style="padding: 10px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 10px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td width="50%" style="color: #f59e0b; font-weight: bold;">Payment Status:</td>
                                    <td width="50%" style="color: #f59e0b; font-weight: bold; text-align: right;">Partial Payment</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            
                            <!-- Paid Amount -->
                            <tr>
                              <td width="40%" style="color: #64748b; padding: 5px 0;">Paid Amount:</td>
                              <td width="60%" style="color: #1e293b; font-weight: 500; text-align: right; padding: 5px 0;">
                                EGP {{PAID_AMOUNT}}
                              </td>
                            </tr>
                            
                            <!-- Remaining -->
                            <tr>
                              <td width="40%" style="color: #64748b; padding: 5px 0;">Remaining:</td>
                              <td width="60%" style="color: #1e293b; font-weight: 500; text-align: right; padding: 5px 0;">
                                EGP {{REMAINING_AMOUNT}}
                              </td>
                            </tr>
                            <!-- END:PARTIAL_PAYMENT -->
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- QR Code Section -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px;">
              <img src="{{QR_CODE_URL}}" alt="Booking QR Code" width="150" height="150" style="display: block; border: 1px solid #e5e7eb; padding: 10px; background-color: #ffffff; margin-bottom: 10px;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">Show this QR code at the venue</p>
            </td>
          </tr>
          
          <!-- Instructions -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Important Information</h3>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                Please arrive 5 minutes before your scheduled time. If you need to cancel or modify your booking, please visit the <a href="https://yourdomain.com/bookings" style="color: #f59e0b; text-decoration: none; font-weight: 500;">My Bookings</a> section of your account.
              </p>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                For any assistance, please contact us at <a href="mailto:support@kroo.com" style="color: #f59e0b; text-decoration: none; font-weight: 500;">support@kroo.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #1e293b; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #f8fafc; font-size: 14px;">
                KROO Reservations © 2025
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Cairo, Egypt
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function sendEmailForBooking(booking) {
  const emailHtml = generateBookingConfirmationEmail(booking)
  const subject = `KROO Booking Confirmation - ${booking.resourceName} on ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
  
  try {
    // Determine recipient based on live mode
    const recipientEmail = LIVE ? booking.userDetails.email : testEmail
    
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: emailHtml,
      noReply: true,
      name: 'KROO Creative Collective'
    });
    
    console.log(`Confirmation email sent successfully to ${recipientEmail}`);
    
    // If in test mode, log the original recipient
    if (!LIVE) {
      console.log(`Test mode: Original recipient would have been ${booking.userDetails.email}`);
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}


  return {
    generateBookingConfirmationEmail,
    sendEmailForBooking
  }

})

// Example code to generate an email for a specific booking
function generateEmailForBooking(booking) {
  // In a real implementation, you would fetch the booking data from your database
  // This is just an example
  booking = booking || {
    resourceName: "Overlook Conference Room",
    date: "2025-05-20",
    startTime: "14:00",
    endTime: "16:00",
    price: 200,
    paymentMethod: "instapay",
    reference: "KROO-20250520-76543",
    userDetails: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+20 123 456 7890"
    },
    // Example of a partial payment (remove this for full payments)
    partialPayment: {
      paid: 150,
      remaining: 50,
      total: 200
    }
  };

  // Generate the email HTML
  const emailHtml = generateBookingConfirmationEmail(booking);

  // In a real implementation, you would send this HTML via your email service
  // For example: sendEmail(booking.userDetails.email, "Your Booking Confirmation", emailHtml);

  return emailHtml;
}