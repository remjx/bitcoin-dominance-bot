
const CoinGecko = require('coingecko-api');
const Twitter = require('twitter');
const { default: millify } = require('millify');
require('dotenv').config()

const CoinGeckoClient = new CoinGecko();

const ids = [
    "bitcoin",
    "bitcoin-cash",
    "bitcoin-cash-sv",
]

function getTicker(id) {
    switch (id) {
        case 'bitcoin': return 'BTC'
        case 'bitcoin-cash': return 'BCH'
        case 'bitcoin-cash-sv': return 'BSV'
    }
}

async function createTweet () {
    let globalDataProm = CoinGeckoClient.global();
    let coinDataProm = CoinGeckoClient.simple.price({
        ids,
        include_market_cap: true,
    })
    const [globalDataResp, coinDataResp] = await Promise.all([globalDataProm, coinDataProm])
    const globalData = globalDataResp.data.data
    const coinData = coinDataResp.data
    const totalMktCap = globalData.total_market_cap.usd
    const totalMktCapFormatted = '$' + millify(totalMktCap, {
        precision: 1,
    })
    const coinDataArr = Object.entries(coinData).sort((a, b) => {
        return b[1].usd_market_cap - a[1].usd_market_cap 
      })
    const bitcoinDominancePct = coinDataArr.map(([, data]) => data.usd_market_cap).reduce((total, current) => total += current) / totalMktCap
    const bitcoinDominancePctFormatted = `${millify(bitcoinDominancePct * 100, { precision: 0 })}%`
    let tweet = ''
    tweet += `#Bitcoin dominates ${bitcoinDominancePctFormatted} of the ${totalMktCapFormatted} crypto market.\n\n`
    coinDataArr.forEach(([id, data]) => {
        tweet +=
            `#${getTicker(id)}: ` + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.usd) + ' ' +
            '\n'
    })
    return tweet
};

async function sendTweet(status) {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY,
        consumer_secret: process.env.TWITTER_API_SECRET_KEY,
        access_token_key: process.env.TWITTER_API_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
    });
    client.post('statuses/update', {status}, function(error, tweet, response) {
        if (!error) {
            console.log('---- Sent this tweet ----')
            console.log(tweet.text);
            console.log('---- End ----')
        } else {
            console.error(error)
            process.exit(1)
        }
    });
}

async function exec() {
    const tweet = await createTweet()
    await sendTweet(tweet)
    // console.log(tweet)
}

exec()