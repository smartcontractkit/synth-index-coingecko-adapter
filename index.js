const rp = require('request-promise')
const snx = require('synthetix')
const Decimal = require('decimal.js')

const getCoinList = async () => {
  try {
    return await rp({
      url: 'https://api.coingecko.com/api/v3/coins/list',
      json: true
    })
  } catch (error) {
    throw error.message
  }
}

const getPriceData = async (id) => {
  try {
    return await rp({
      url: 'https://api.coingecko.com/api/v3/simple/price',
      qs: {
        ids: id,
        vs_currencies: 'usd'
      },
      json: true
    })
  } catch (error) {
    throw error.message
  }
}

const calculateIndex = (indexes) => {
  let value = new Decimal(0)
  try {
    indexes.forEach(i => {
      const price = i.priceData[i.coinId].usd
      if (price <= 0)
        throw 'invalid price'
      value = value.plus(new Decimal(i.units).times(new Decimal(price)))
    })
  } catch (error) {
    throw error.message
  }
  return value.toNumber()
}

const createRequest = async (input, callback) => {
  const asset = input.data.asset || 'sCEX'
  const datas = snx.getSynths({network: 'mainnet'}).filter(({index, inverted}) => index && !inverted)
  const data = datas.find(d => d.name.toLowerCase() === asset.toLowerCase())
  try {
    const coinList = await getCoinList()
    await Promise.all(data.index.map(async (synth) => {
      const coin = coinList.find(d => d.symbol.toLowerCase() === synth.symbol.toLowerCase())
      synth.coinId = coin.id
      synth.priceData = await getPriceData(coin.id)
    }))
    data.result = calculateIndex(data.index)
    callback(200, {
      jobRunID: input.id,
      data: data,
      result: data.result,
      statusCode: 200
    })
  } catch (error) {
    callback(500, {
      jobRunID: input.id,
      status: 'errored',
      error: error,
      statusCode: 500
    })
  }
}

exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

module.exports.createRequest = createRequest
