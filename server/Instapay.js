(function (root, factory) {
  root.INSTAPAY = factory();
})(this, function () {

  /**
   * Test functions for verification
   */
  function testVerification() {
    // Example OCR result similar to what your API returns
    const ocrResult = {
      metadata: { DateTimeOriginal: null, Software: null, CreateDate: null, ModifyDate: null },
      score: 5.0,
      fields: [
        { name: 'amount', value: '200' },
        { name: 'date', value: '08 May 2025 07:37 PM' },
        { name: 'from', value: 'ehabmohamed007@instapay' },
        { name: 'reference', value: '512822790027' },
        { name: 'to', value: 'MOHAMED H***** A*** A** A**** cairoconfessions@instapay' },
        { name: 'transaction_status', value: 'Your transaction was successful' }
      ],
      hash: 'c19b44789fe02e63f1e18a3d982239d35ef3474318c2b6eb385d339d59a59401',
      suspicion: ['No EXIF metadata – screenshot may have been altered or saved from an app'],
      confidence: 'Medium'
    };

    // Test with different configurations
    Logger.log("Standard verification (10 minute window):");
    Logger.log(JSON.stringify(verifyInstapayTransaction(ocrResult)));

    Logger.log("Strict verification (5 minute window, strict metadata):");
    Logger.log(JSON.stringify(verifyInstapayTransaction(ocrResult, {
      maxAgeMins: 5,
      strictMetadataCheck: true
    })));

    // Test with Arabic status
    const arabicOcrResult = Object.assign({}, ocrResult);
    arabicOcrResult.fields = ocrResult.fields.map(field => {
      if (field.name === 'transaction_status') {
        return { name: 'transaction_status', value: 'تمت العملية بنجاح' };
      }
      return field;
    });

    Logger.log("Arabic transaction verification:");
    Logger.log(JSON.stringify(verifyInstapayTransaction(arabicOcrResult)));
  }

  /**
   * Test the full process with a file from Drive
   * This simulates receiving an image from the frontend
   */
  function testProcessWithDriveFile() {
    // Get the image file from Drive
    const image = DriveApp.getFileById("171KhDkm9OAgQybFtogc-vInLNjfT6JBT").getBlob();

    // Process and verify the image with different configurations

    // 1. Basic verification (no amount check)
    const basicResult = processAndVerifyReceipt(image, {
      maxAgeMins: 15,
      strictMetadataCheck: false
    });

    Logger.log("Basic verification result:");
    Logger.log(JSON.stringify(basicResult));

    // 2. With expected amount that matches
    const matchingAmountResult = processAndVerifyReceipt(image, {
      maxAgeMins: 15,
      strictMetadataCheck: false,
      expectedAmount: 200 // Assuming the amount in the image is 200
    });

    Logger.log("Verification with matching amount:");
    Logger.log(JSON.stringify(matchingAmountResult));

    // 3. With expected amount that is less than actual
    const lessThanActualResult = processAndVerifyReceipt(image, {
      maxAgeMins: 15,
      strictMetadataCheck: false,
      expectedAmount: 150, // Less than the image amount
      allowMoreThanExpected: true
    });

    Logger.log("Verification with amount less than actual (allowing more):");
    Logger.log(JSON.stringify(lessThanActualResult));

    // 4. With expected amount that is less than actual, but not allowing more
    const lessThanActualNotAllowedResult = processAndVerifyReceipt(image, {
      maxAgeMins: 15,
      strictMetadataCheck: false,
      expectedAmount: 150, // Less than the image amount
      allowMoreThanExpected: false
    });

    Logger.log("Verification with amount less than actual (not allowing more):");
    Logger.log(JSON.stringify(lessThanActualNotAllowedResult));

    // 5. With expected amount that is more than actual
    const moreThanActualResult = processAndVerifyReceipt(image, {
      maxAgeMins: 15,
      strictMetadataCheck: false,
      expectedAmount: 250 // More than the image amount
    });

    Logger.log("Verification with amount more than actual:");
    Logger.log(JSON.stringify(moreThanActualResult));
  }/**
 * Processes a receipt image and verifies the InstaPay transaction
 * @param {Blob} imageBlob - The image blob from the frontend
 * @param {Object} options - Configuration options including maxAgeMins and expectedAmount
 * @returns {Object} The verification result
 */

  function processAndVerifyReceipt(imageInput, options = {}) {
    try {
      // Default options
      const verificationOptions = {
        // maxAgeMins: options.maxAgeMins || 10,
        maxAgeMins: 3000,
        strictMetadataCheck: options.strictMetadataCheck || false,
        expectedAmount: options.expectedAmount, // The expected transaction amount
        allowMoreThanExpected: options.allowMoreThanExpected !== false // Default to true
      };

      // Handle different input types
      let base64;

      // Check if imageInput is already base64
      if (typeof imageInput === 'string' && imageInput.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/)) {
        // Input is already base64
        Logger.log("Input is already base64 string");
        base64 = imageInput;
      }
      // Check if it's a blob object with getBytes method
      else if (imageInput && typeof imageInput.getBytes === 'function') {
        // Convert blob to base64
        Logger.log("Converting blob to base64");
        base64 = Utilities.base64Encode(imageInput.getBytes());
      }
      // Check if it's an object with data property containing base64
      else if (imageInput && imageInput.data && typeof imageInput.data === 'string') {
        Logger.log("Extracting base64 from object.data");
        base64 = imageInput.data;
      }
      // Handle other cases
      else {
        throw new Error("Invalid image input: Must be a blob or base64 string");
      }

      const INSTAPAY_CLOUD_FUNCTION = PropertiesService.getScriptProperties().getProperty("instapayCloudFunction");

      try {
        // Call the OCR processing service with muteHttpExceptions to catch server errors
        const response = UrlFetchApp.fetch(INSTAPAY_CLOUD_FUNCTION, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({ base64Image: base64 }),
          muteHttpExceptions: true // This prevents exceptions on HTTP errors
        });

        // Check if the response is a 500 or other error
        if (response.getResponseCode() >= 400) {
          Logger.log("OCR service error: " + response.getResponseCode());
          return JSON.stringify({
            success: false,
            error: "This doesn't appear to be a valid Instapay receipt. Please upload a screenshot of your payment."
          });
        }

        // Parse the OCR result
        const ocrResult = JSON.parse(response.getContentText());
        Logger.log("OCR Result:");
        Logger.log(ocrResult);

        // Verify the transaction
        const verificationResult = verifyInstapayTransaction(ocrResult, verificationOptions);

        Logger.log("Verification Result:");
        Logger.log(verificationResult);

        const responseToFrontEnd = {
          success: true,
          result: {
            ocrResult: ocrResult,
            verification: verificationResult
          }
        };

        return JSON.stringify(responseToFrontEnd);
      } catch (fetchError) {
        // Catch any errors during the API call or processing
        Logger.log("Error calling OCR service: " + fetchError);
        return JSON.stringify({
          success: false,
          error: "This doesn't appear to be a valid Instapay receipt. Please upload a screenshot of your payment."
        });
      }
    } catch (generalError) {
      // Catch any general errors
      Logger.log("General error in processAndVerifyReceipt: " + generalError);
      return JSON.stringify({
        success: false,
        error: "This doesn't appear to be a valid Instapay receipt. Please upload a screenshot of your payment."
      });
    }
  }

  /**
   * Verifies if an InstaPay transaction is legitimate based on OCR results and metadata
   * @param {Object} ocrResult - The result from the OCR processing
   * @param {Object} options - Configuration options
   * @param {number} options.maxAgeMins - Maximum age of transaction in minutes (default: 10)
   * @param {boolean} options.strictMetadataCheck - Whether to strictly enforce metadata presence (default: false)
   * @param {number|string} options.expectedAmount - The expected transaction amount (optional)
   * @param {boolean} options.allowMoreThanExpected - Whether to allow amounts greater than expected (default: true)
   * @returns {Object} Verification result with status and reasons
   */
  function verifyInstapayTransaction(ocrResult, options = {}) {
    console.log(ocrResult)
    // Default options
    const config = {
      maxAgeMins: options.maxAgeMins || 10,
      strictMetadataCheck: options.strictMetadataCheck || false,
      expectedAmount: options.expectedAmount,
      allowMoreThanExpected: options.allowMoreThanExpected !== false // Default to true
    };

    // Initialize result object with clear status flags
    const result = {
      isLegitimate: true,
      isRightAmount: true,
      amountStatus: "exact", // "exact", "more", "less", or "invalid"
      remainder: 0,          // Positive: we owe them, Negative: they owe us
      reasons: [],
      warnings: [],
      // Add explicit flags for key fields
      hasReferenceNumber: false,
      hasTimestamp: false,
      hasAmount: false,
      hasStatus: false,
      metadataTimestampUsed: false
    };

    // 1. Check transaction status
    const statusField = findField(ocrResult.fields, 'transaction_status');
    if (!statusField) {
      result.isLegitimate = false;
      result.reasons.push("Missing transaction status field");
      result.hasStatus = false;
    } else {
      result.hasStatus = true;
      const statusText = statusField.value.toLowerCase();
      const successPatterns = [
        'successful',
        'success',
        'completed',
        'تمت العملية بنجاح',
        'تمت بنجاح',
        'ناجحة',
        'نجاح'
      ];

      const isSuccess = successPatterns.some(pattern => statusText.includes(pattern));
      if (!isSuccess) {
        result.isLegitimate = false;
        result.reasons.push(`Transaction status is not successful: ${statusField.value}`);
      }
    }

    // 2. Verify transaction date and time
    // First check for metadata timestamp
    let hasValidTimestamp = false;
    let transactionDate = null;

    // Check metadata first (if available)
    if (ocrResult.metadata &&
      (ocrResult.metadata.DateTimeOriginal ||
        ocrResult.metadata.CreateDate ||
        ocrResult.metadata.ModifyDate)) {

      // Use the first available metadata timestamp
      const metaTimestamp = ocrResult.metadata.DateTimeOriginal ||
        ocrResult.metadata.CreateDate ||
        ocrResult.metadata.ModifyDate;

      try {
        // Parse metadata timestamp
        const metaDate = new Date(metaTimestamp);
        if (!isNaN(metaDate.getTime())) {
          transactionDate = metaDate;
          hasValidTimestamp = true;
          result.metadataTimestampUsed = true;
          console.log("Using metadata timestamp:", metaTimestamp);
        }
      } catch (e) {
        console.log("Could not parse metadata timestamp:", e);
      }
    }

    // If no metadata timestamp, try OCR date field
    if (!hasValidTimestamp) {
      const dateField = findField(ocrResult.fields, 'date');
      if (!dateField) {
        result.warnings.push("Missing date field");
        result.hasTimestamp = false;
      } else {
        try {
          // Parse the date from the OCR text
          transactionDate = parseTransactionDate(dateField.value);

          if (!transactionDate || isNaN(transactionDate.getTime())) {
            result.warnings.push(`Could not parse transaction date: ${dateField.value}`);
            result.hasTimestamp = false;
          } else {
            hasValidTimestamp = true;
            result.hasTimestamp = true;
          }
        } catch (error) {
          result.warnings.push(`Error processing date: ${error.message}`);
          result.hasTimestamp = false;
        }
      }
    } else {
      // If we used metadata timestamp, still mark hasTimestamp
      result.hasTimestamp = true;
    }

    // Check timestamp validity if we have one
    if (hasValidTimestamp) {
      // Check if transaction is recent enough
      const currentTime = new Date();
      const diffMs = currentTime - transactionDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > config.maxAgeMins) {
        result.isLegitimate = false;
  
        // Format the time difference in a human-readable way
        let timeAgoMessage;
        if (diffMins < 60) {
          timeAgoMessage = `${diffMins} minutes`;
        } else if (diffMins < 1440) {
          const hours = Math.floor(diffMins / 60);
          timeAgoMessage = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
          const days = Math.floor(diffMins / 1440);
          timeAgoMessage = `${days} ${days === 1 ? 'day' : 'days'}`;
        }
        result.reasons.push(`Transaction is too old (${timeAgoMessage} ago, max allowed: ${config.maxAgeMins} minutes)`);
      }

      // Check if the transaction date is in the future
      if (transactionDate > currentTime) {
        result.isLegitimate = false;
        result.reasons.push(`Transaction date is in the future: ${transactionDate.toISOString()}`);
      }
    } else if (!result.hasTimestamp) {
      // No valid timestamp found - add as a reason
      result.isLegitimate = false;
      result.reasons.push("No valid transaction timestamp found");
    }

    // 3. Check for suspicious indicators
    if (ocrResult.suspicion && ocrResult.suspicion.length > 0) {
      // Check if metadata is missing
      const metadataMissing = ocrResult.suspicion.some(s =>
        s.includes("No EXIF metadata") ||
        s.includes("metadata")
      );

      if (metadataMissing) {
        if (config.strictMetadataCheck) {
          result.isLegitimate = false;
          result.reasons.push("Missing required metadata (possible manipulation)");
        } else {
          result.warnings.push("Missing metadata (possible manipulation but allowed by config)");
        }
      }

      // Check for other suspicions
      ocrResult.suspicion.forEach(suspicion => {
        if (!suspicion.includes("No EXIF metadata")) {
          if (suspicion.includes("date is outside expected range") ||
            suspicion.includes("OCR date is outside expected range")) {
            result.warnings.push("Date is outside expected range");
          } else {
            result.warnings.push(`Suspicion: ${suspicion}`);
          }
        }
      });
    }

    // 4. Check confidence score
    if (ocrResult.confidence) {
      const confidenceLevels = {
        'high': 3,
        'medium': 2,
        'low': 1
      };

      const confidenceScore = confidenceLevels[ocrResult.confidence.toLowerCase()] || 0;

      if (confidenceScore < 2) {  // Below medium
        result.warnings.push(`Low confidence in OCR results: ${ocrResult.confidence}`);
      }
    }

    // 5. Explicitly check for required fields, especially reference number
    const referenceField = findField(ocrResult.fields, 'reference');
    if (!referenceField) {
      result.isLegitimate = false;
      result.reasons.push("Missing required reference number field");
      result.hasReferenceNumber = false;
    } else {
      result.hasReferenceNumber = true;

      // Most InstaPay reference numbers are standard lengths
      if (referenceField.value.length < 8) {
        result.warnings.push(`Reference number seems too short: ${referenceField.value}`);
      }
    }

    // 6. Check actual amount value
    const amountField = findField(ocrResult.fields, 'amount');
    if (!amountField) {
      result.isLegitimate = false;
      result.reasons.push("Missing required amount field");
      result.hasAmount = false;
    } else {
      result.hasAmount = true;

      const amount = parseFloat(amountField.value);
      if (isNaN(amount) || amount <= 0) {
        result.isLegitimate = false;
        result.amountStatus = "invalid";
        result.reasons.push(`Invalid transaction amount: ${amountField.value}`);
      }

      // Verify the amount matches the expected amount if provided
      if (config.expectedAmount !== undefined && config.expectedAmount !== null) {
        const expectedAmount = parseFloat(config.expectedAmount);

        // Check if the expected amount is valid
        if (!isNaN(expectedAmount) && expectedAmount > 0) {
          // Calculate the remainder
          result.remainder = amount - expectedAmount;

          if (amount === expectedAmount) {
            // Exact match
            result.amountStatus = "exact";
          } else if (amount > expectedAmount) {
            // More than expected
            result.amountStatus = "more";

            // If we don't allow more than expected, mark as incorrect
            if (!config.allowMoreThanExpected) {
              result.isRightAmount = false;
              result.reasons.push(`Amount is more than expected: ${amount} vs ${expectedAmount} (excess: ${result.remainder})`);
            } else {
              // We allow more, so add a warning but don't mark as incorrect
              result.warnings.push(`Amount is more than expected: ${amount} vs ${expectedAmount} (excess: ${result.remainder})`);
            }
          } else {
            // Less than expected
            result.amountStatus = "less";
            result.isRightAmount = false;
            result.reasons.push(`Amount is less than expected: ${amount} vs ${expectedAmount} (shortfall: ${Math.abs(result.remainder)})`);
          }

          // Update isLegitimate based on isRightAmount only if the amount isn't right
          if (!result.isRightAmount) {
            result.isLegitimate = false;
          }
        }
      }
    }

    // Add debug information to understand what's happening
    console.log("Verification result:", {
      isLegitimate: result.isLegitimate,
      hasReferenceNumber: result.hasReferenceNumber,
      hasTimestamp: result.hasTimestamp,
      hasAmount: result.hasAmount,
      hasStatus: result.hasStatus,
      metadataTimestampUsed: result.metadataTimestampUsed,
      reasons: result.reasons
    });

    return result;
  }

  /**
   * Helper function to find a field by name in the OCR results
   * @param {Array} fields - Array of field objects from OCR result
   * @param {string} fieldName - The name of the field to find
   * @returns {Object|null} The field object or null if not found
   */
  function findField(fields, fieldName) {
    return fields.find(field => field.name === fieldName);
  }

  /**
   * Parse transaction date from various formats
   * @param {string} dateStr - Date string from OCR
   * @returns {Date|null} Parsed date or null if parsing failed
   */
  function parseTransactionDate(dateStr) {
    if (!dateStr) return null;

    // Try direct Date parsing first (works for some formats)
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Format: "08 May 2025 07:37 PM"
    const engDateRegex = /(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}):(\d{1,2})\s+(\w{2})/i;
    const engMatch = dateStr.match(engDateRegex);

    if (engMatch) {
      const months = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };

      const day = parseInt(engMatch[1]);
      const monthStr = engMatch[2].toLowerCase().substring(0, 3);
      const month = months[monthStr];
      const year = parseInt(engMatch[3]);
      let hours = parseInt(engMatch[4]);
      const minutes = parseInt(engMatch[5]);
      const ampm = engMatch[6].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      if (month !== undefined) {
        return new Date(year, month, day, hours, minutes);
      }
    }

    // Format: "04 Apr 2025 05:04 PM"
    // This is handled by the above regex

    // Arabic date format detection
    // This is a simplified check, may need enhancement for specific Arabic date formats
    if (/[\u0600-\u06FF]/.test(dateStr)) {
      // For Arabic dates, we would need more complex parsing
      // This is a placeholder for Arabic date parsing
      return null;
    }

    return null;
  }


  return {
    testProcessWithDriveFile,
    processAndVerifyReceipt
  }

})

function verifyInstapayPayment(dataObj) {
  const imageBlob = dataObj.fileContent
  console.log(dataObj)
  return INSTAPAY.processAndVerifyReceipt(imageBlob, dataObj)
}

function testProcessWithDriveFile() {
  return INSTAPAY.testProcessWithDriveFile()
}