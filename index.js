const httpRepository = require('./http.repository')

async function adjustMatterValueAndInject({ authorizationCode, flowRate, intermix }) {
  const injectMatter = (value) => httpRepository.injectMatter(authorizationCode, value)
  const injectAntiMatter = (value) => httpRepository.injectAntiMatter(authorizationCode, value)

  if (intermix <= 0.5 && flowRate === 'LOW') {
    await injectMatter(0.2)
  } else if (intermix > 0.5 && flowRate === 'LOW') {
    await injectAntiMatter(0.2)
  } else if (intermix >= 0.5 && flowRate === 'HIGH') {
    await injectMatter(-0.2)
  } else if (intermix < 0.5 && flowRate === 'HIGH') {
    await injectAntiMatter(-0.2)
  } else if (intermix <= 0.5) {
    await injectMatter(0.2)
  } else {
    await injectAntiMatter(0.2)
  }
}

async function delayInMs(value) {
  return new Promise(resolve => setTimeout(resolve, value))
}

const delayBetweenInjectCallsInMs = 1000

async function run({ totalCount, authorizationCode }) {
  let status = {}
  let injectLastCallDate = null

  for (let count = 0; count < totalCount; count++) {
    try {
      status = await httpRepository.getEngineStatus(authorizationCode)
    } catch (_) {
      throw `Engine went boom on #${count} of #${totalCount} runs!`
    }

    const { flowRate, intermix } = status

    // It is safe to inject every second (1000 ms)
    // We check the time between now and previous inject call
    // If the time is greater than delayBetweenInjectCallsInMs, we can inject immediately
    // Otherwise, we get the difference

    const delayTimeInMs =
      injectLastCallDate === null
        ? 0
        : Math.max(0, delayBetweenInjectCallsInMs - (new Date().getTime() - injectLastCallDate.getTime()))
    console.log(`Delaying inject for ${delayTimeInMs} ms`)
    await delayInMs(delayTimeInMs)

    await adjustMatterValueAndInject({
      authorizationCode,
      flowRate: flowRate,
      intermix: intermix
    })

    // to be on the safe side, we track the time after response
    injectLastCallDate = new Date()
  }

  return status
}

async function main({ name, email, totalCount }) {
  const { authorizationCode } = await httpRepository.authorize({ name, email })

  return await run({ totalCount, authorizationCode })
}

const totalCount = 60
main({ name: 'Sandra', email: 'sandra.jogi@gmail.com', totalCount })
  .then(result => console.log(`Executed #${totalCount} times. Finished with flow rate of ${result.flowRate} and intermix of ${result.intermix}`))
  .catch(err => console.error(err))
