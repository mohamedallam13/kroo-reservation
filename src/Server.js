const request = {
  page: "index",
}

function doGet(e) {
  const params = e.parameters || {}
  console.log('Raw params:', params)
  
  let userProps = {}
  
  // Check if we have hash parameter first
  if (params.h && params.h[0]) {
    console.log('Using hash parameter')
    const decoded = HELPERS.decodeParams(params.h[0])
    
    if (decoded) {
      userProps = {
        userEmail: decoded.email || '',
        userName: decoded.name || '',
        userPhone: decoded.phone || '',
        userDiscount: decoded.discount || 0,
        isAdmin: decoded.admin || false
      }
      console.log('Decoded from hash:', userProps)
    } else {
      console.log('Hash decode failed, using defaults')
      userProps = {
        userEmail: '',
        userName: '',
        userPhone: '',
        userDiscount: 0,
        isAdmin: false
      }
    }
  } 
  // Fallback to direct parameters (for backward compatibility)
  else {
    console.log('Using direct parameters')
    userProps = {
      userEmail: params.email ? params.email[0] : '',
      userName: params.name ? params.name[0] : '',
      userPhone: params.phone ? params.phone[0] : '',
      userDiscount: params.discount ? parseInt(params.discount[0], 10) : 0,
      isAdmin: params.admin ? params.admin[0] === 'true' : false
    }
  }
  
  console.log('Final userProps:', userProps)
  
  const { page, props = {} } = request
  return _R(page, { ...props, ...userProps }, { 
    metaData: [{ name: "viewport", content: "width=device-width, initial-scale=1" }] 
  })
}