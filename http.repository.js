const { default: axios } = require('axios')

module.exports = {
  authorize,
  getEngineStatus,
  injectAntiMatter,
  injectMatter,
}

async function authorize({ name, email }) {
  console.log('authorize request', new Date())

  const response = await axios.post('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/start', {
    name:  name,
    email: email
  })

  console.log('authorize response', response.data, new Date())

  return response.data
}

async function getEngineStatus(authorizationCode) {
  console.log('getEngineStatus request', new Date())

  const response = await axios.get('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/status', {
    params: {
      authorizationCode: authorizationCode
    }
  })

  console.log('getEngineStatus response', response.data, new Date())

  return response.data
}

async function injectMatter(authorizationCode, value) {
  console.log('injectMatter request', value, new Date())

  await axios.post('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/adjust/matter', {
    authorizationCode: authorizationCode,
    value:             value
  })

  console.log('injectMatter response', new Date())

  return true
}

async function injectAntiMatter(authorizationCode, value) {
  console.log('injectAntiMatter request', value, new Date())

  await axios.post('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/adjust/antimatter', {
    authorizationCode: authorizationCode,
    value:             value
  })

  console.log('injectAntiMatter response', new Date())

  return true
}
