const request = {
  page: "index",
}

function doGet(e) {
  const params = e.parameters || {}
  console.log(params)
  
  // Extract user parameters
  const userProps = {
    userEmail: params.email ? params.email[0] : '',
    userName: params.name ? params.name[0] : '',
    userDiscount: params.discount ? parseInt(params.discount[0], 10) : 0,
    isAdmin: params.admin ? params.admin[0] === 'true' : false
  }
  
  const { page, props = {} } = request
  return _R(page, { ...props, ...userProps }, { metaData: [{ name: "viewport", content: "width=device-width, initial-scale=1" }] })
}