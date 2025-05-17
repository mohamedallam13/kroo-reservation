(function (root, factory) {
  root.KROO_BOOKING_APP = factory();
})(this, function () {

  const { Toolkit, SHEETS } = KROOLibraries
  const { getSheetObjFromParamObj, createWriteArr, writeToSheet } = SHEETS
  const { readFromJSON, writeToJSON, timestampCreate, groupBy } = Toolkit
  const { convertDriveUrlToDirectImageUrl } = HELPERS


  const MASTER_INDEX_ID = "1t-33O0glZeAdzR0Oc275mjnXWH_6xdHj"

  const RESRVE_SSID = "1tp26k3no0b82QQE8TkCzBLd8JqoO_v2LV3cG_jeiYQs"
  const reserveSheetName = "Room Reservations"
  const newMemberSheetName = "New Member Info"
  const parseObj = {
    headerRow: 1,
    skipRows: 1
  }

  let reservationsSheetObj
  let newMembersSheetObj
  let timestamp

  function fetchData() {
    const masterFile = readFromJSON(MASTER_INDEX_ID)
    const { krooResourcesRooms } = masterFile
    const resourcesArray = readFromJSON(krooResourcesRooms)
    convertImagesToDirectLinkExport(resourcesArray)
    return JSON.stringify({ krooResourcesRooms: resourcesArray })
  }

  function convertImagesToDirectLinkExport(resourcesArray) {
    resourcesArray.forEach(resource => {
      resource.image = convertDriveUrlToDirectImageUrl(resource.imageLink)
    })
  }

  function addBookingToBuffer(booking) {
    try {
      timestamp = timestampCreate(undefined, "M/d/YYYY HH:mm:ss");
      const masterFile = readFromJSON(MASTER_INDEX_ID);
      const { bookingBuffer } = masterFile;
      const pendingBookings = readFromJSON(bookingBuffer);

      // Check if booking reference already exists in the buffer
      const existingBookingIndex = pendingBookings.findIndex(
        existingBooking => existingBooking.reference === booking.reference
      );

      // If booking already exists, return without adding
      if (existingBookingIndex !== -1) {
        console.log(`Booking with reference ${booking.reference} already exists in buffer`)
        return JSON.stringify({
          success: false,
          message: `Booking with reference ${booking.reference} already exists in buffer`,
          existingBooking: pendingBookings[existingBookingIndex]
        });
      }
      pendingBookings.push(booking);
      writeToJSON(bookingBuffer, pendingBookings);
      console.log(`Booking ${booking.reference} added to buffer successfully`)

      return JSON.stringify({
        success: true,
        message: `Booking ${booking.reference} added to buffer successfully`
      });
    } catch (error) {
      // Handle any errors
      console.log(`Error adding booking to buffer: ${error.message}`)
      return JSON.stringify({
        success: false,
        message: `Error adding booking to buffer: ${error.message}`
      });
    }
  }

  function addBookingToDB(booking) {
    timestamp = timestampCreate(undefined, "M/d/YYYY HH:mm:ss")
    getSheets()
    // Check if reservation already exisits in DB to avoid duplication
    const indexedReservations = reservationsSheetObj.indexObjectifiedValues("bookingReference").indexedValues
    const {reference} = booking
    console.log(indexedReservations)
    if(indexedReservations[reference]){
      console.log("Reservation already in DB!")
      return
    }
    // Create new bookings
    const bookingObj = new BookingObj(booking)
    const resrveWriteArr = createWriteArr([bookingObj], reservationsSheetObj)
    writeToSheet(resrveWriteArr, reservationsSheetObj)
    if (booking.userDetails.isNewUser) {
      const memberObj = new MemberObj(booking)
      const memberWriteArr = createWriteArr([memberObj], newMembersSheetObj)
      writeToSheet(memberWriteArr, newMembersSheetObj)
    }
    removeFromBuffer(booking)
    sendConfirmationEmail(booking)
  }

  function getSheets() {
    reservationsSheetObj = getSheetObjFromParamObj({ ssid: RESRVE_SSID, sheetName: reserveSheetName, parseObj })
    newMembersSheetObj = getSheetObjFromParamObj({ ssid: RESRVE_SSID, sheetName: newMemberSheetName, parseObj })
  }

  function removeFromBuffer(booking) {
    const bookingReference = booking.reference
    const masterFile = readFromJSON(MASTER_INDEX_ID);
    const { bookingBuffer } = masterFile;
    const pendingBookings = readFromJSON(bookingBuffer);
    const bookingIndex = pendingBookings.findIndex(booking => booking.reference === bookingReference);
    if (bookingIndex !== -1) {
      pendingBookings.splice(bookingIndex, 1);
      writeToJSON(bookingBuffer, pendingBookings);
      // Return success and removed booking
      console.log(`Booking ${bookingReference} removed from buffer`)
      return {
        success: true,
        message: `Booking ${bookingReference} removed from buffer`,
        removedBooking: pendingBookings[bookingIndex]
      };
    } else {
      // Booking not found
      console.log(`Booking with reference ${bookingReference} not found in buffer`)
      return {
        success: false,
        message: `Booking with reference ${bookingReference} not found in buffer`
      };
    }
  }
  function sendConfirmationEmail() {

  }

  function addToCalendar() {

  }

  function BookingObj(booking) {
    this.timestamp = timestamp
    this.bookingReference = booking.reference
    this.bookingType = booking.bookingType
    this.bookingStatus = booking.status
    this.createdEmail = booking.createdBy.email
    this.isAdmin = booking.createdBy.isAdmin ? "TRUE" : "FALSE"
    this.email = booking.userDetails.email
    this.room = booking.resourceLabel
    this.originalPrice = booking.originalPrice
    this.price = booking.price
    this.discount = booking.discountApplied
    this.paymentMethod = booking.paymentMethod
    this.paymentStatus = booking.paymentStatus
    const day = timestampCreate(new Date(booking.date), "M/d/YYYY")
    this.day = day
    this.from = booking.startTime
    this.to = booking.endTime
    this.duration = booking.duration
    this.resourceId = booking.resourceId
  }

  function MemberObj(booking) {
    const { userDetails } = booking
    this.timestamp = timestamp
    this.email = userDetails.email
    this.fullName = userDetails.name
    this.phone = userDetails.phone
  }


  function cancelBooking() {

  }


  return {
    fetchData,
    addBookingToBuffer,
    addBookingToDB,
    cancelBooking
  }

})

function fetchData() {
  return KROO_BOOKING_APP.fetchData()
}

const testBookingA = {
  reference: "KROO-20250517-45821",
  resourceId: 3,
  resourceName: "Executive Meeting Room",
  date: "2025-05-20",
  startTime: "14:00",
  endTime: "16:00",
  duration: 2,
  status: "CONFIRMED",
  price: 270.00,
  originalPrice: 300.00,
  discountApplied: 10,
  paymentMethod: "instapay",
  paymentStatus: "completed",
  createdAt: "2025-05-17T12:43:21.524Z",
  userDetails: {
    email: "sarah.smith@example.com",
    name: "Sarah Smith",
    phone: "+20 123 456 7891",
    discount: 10
  },
  createdBy: {
    email: "admin@example.com",
    isAdmin: true
  },
  bookingType: "ADMIN_FOR_EXISTING"
}

const testBookingB = {
  reference: "KROO-20250517-78354",
  resourceId: 2,
  resourceName: "Focus Pod A",
  date: "2025-05-18",
  startTime: "10:00",
  endTime: "12:00",
  duration: 2,
  status: "CONFIRMED",
  price: 150.00,
  originalPrice: 150.00,
  discountApplied: 0,
  paymentMethod: "cash",
  paymentStatus: "pending",
  createdAt: "2025-05-17T13:15:45.120Z",
  userDetails: {
    email: "new.user@example.com",
    name: "New User",
    phone: "+20 123 789 4560",
    discount: 0,
    isNewUser: true
  },
  createdBy: {
    email: "admin@example.com",
    isAdmin: true
  },
  bookingType: "ADMIN_FOR_NEW"
}

const testBookingC = {
  reference: "KROO-20250517-29637",
  resourceId: 1,
  resourceName: "Overlook Conference Room",
  resourceLabel: "ORLK",
  date: "2025-05-19",
  startTime: "09:00",
  endTime: "11:00",
  duration: 2,
  status: "CONFIRMED",
  price: 190.00,
  originalPrice: 200.00,
  discountApplied: 5,
  paymentMethod: "credit-card",
  paymentStatus: "completed",
  createdAt: "2025-05-17T14:22:10.872Z",
  userDetails: {
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+20 123 456 7890"
  },
  createdBy: {
    email: "john.doe@example.com",
    isAdmin: false
  },
  bookingType: "EXISTING_USER"
}
const testBookingD = {
  reference: "KROO-20250517-63421",
  resourceId: 6,
  resourceName: "Garden Lounge",
  resourceLabel: "ECPS",
  date: "2025-05-21",
  startTime: "13:00",
  endTime: "15:00",
  duration: 2,
  status: "CONFIRMED",
  price: 220.00,
  originalPrice: 220.00,
  discountApplied: 0,
  paymentMethod: "instapay",
  paymentStatus: "completed",
  createdAt: "2025-05-17T15:08:33.291Z",
  userDetails: {
    email: "guest.booker@example.com",
    name: "Guest Booker",
    phone: "+20 111 222 3333",
    isNewUser: true
  },
  createdBy: {
    email: "guest.booker@example.com",
    isAdmin: false
  },
  bookingType: "PUBLIC_NEW_USER"
}
function addBookingToBuffer(booking) {
  booking = booking || testBookingD
  return KROO_BOOKING_APP.addBookingToBuffer(booking)
}

function addBookingToDatabase(booking) {
  booking = booking || testBookingD
  return KROO_BOOKING_APP.addBookingToDB(booking)
}

function testTimestamp() {
  const time = "2025-05-21"
  const date = new Date(time)
  console.log(date)
}
