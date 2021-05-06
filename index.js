
const CoinGecko = require('coingecko-api');
const Twitter = require('twitter');
const { default: millify } = require('millify');
require('dotenv').config()

const CoinGeckoClient = new CoinGecko();

async function createTweet () {
    function getTicker(id) {
        switch (id) {
            case 'bitcoin': return 'BTC'
            case 'bitcoin-cash': return 'BCH'
            case 'bitcoin-cash-sv': return 'BSV'
            case 'bitcoin-gold': return 'BTG'
            case 'bitcoin-diamond': return 'BCD'
        }
    }
    const ids = [
        "bitcoin",
        "bitcoin-cash",
        "bitcoin-cash-sv",
        "bitcoin-gold",
        "bitcoin-diamond"
    ]
    let globalDataProm = CoinGeckoClient.global();
    let coinDataProm = CoinGeckoClient.simple.price({
        ids,
        include_market_cap: true,
        include_24hr_change: true,
    })
    const [globalDataResp, coinDataResp] = await Promise.all([globalDataProm, coinDataProm])
    const globalData = globalDataResp.data.data
    const coinData = coinDataResp.data
    const totalMktCap = globalData.total_market_cap.usd
    const totalMktCapReadable = '$' + millify(totalMktCap, {
        precision: 1,
    })
    const coinDataArr = Object.entries(coinData).sort((a, b) => {
        return b[1].usd_market_cap - a[1].usd_market_cap 
      })
    const bitcoinDominance = coinDataArr.map(([id, data]) => data.usd_market_cap).reduce((total, current) => total += current) / totalMktCap
    const bitcoinDominanceReadable = `${millify(bitcoinDominance * 100, { precision: 0 })}%`
    let tweet = ''
    tweet += `Bitcoin Dominance is ${bitcoinDominanceReadable} of ${totalMktCapReadable} crypto market\n`
    coinDataArr.forEach(([id, data]) => {
        const marketCapPct = data.usd_market_cap / totalMktCap
        tweet +=
            `${getTicker(id)}: ` + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.usd) + ' ' +
            `(${millify(marketCapPct * 100, { precision: 1 })}%)` + ' ' +
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
            console.log(error)
        }
    });
}

async function exec() {
    const tweet = await createTweet()
    await sendTweet(tweet)
}

exec()