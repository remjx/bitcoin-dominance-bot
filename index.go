package main

 // https://github.com/dghubble/go-twitter
  // https://developer.twitter.com/en/docs

import (
	// "net/http"
	// "io/ioutil"
	// "strings"
	// "time"
	"log"
	"fmt"
	"encoding/json"
	// "sort"
)

func main() {
	// httpClient := &http.Client{
	// 	Timeout: time.Second * 10,
	// }

	ids := []string{"bitcoin", "bitcoin-cash", "bitcoin-cash-sv"}
	const vs_currency = "usd"

	// resp, err := httpClient.Get(
	// 	"https://api.coingecko.com/api/v3/simple/price?ids=" + strings.Join(ids, ",") +
	// 	"&vs_currencies=" + vs_currency +
	// 	"&include_market_cap=true")
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// body, err := ioutil.ReadAll(resp.Body)
	// if err != nil {
	//    log.Fatalln(err)
	// }
	body := []byte(`{"bitcoin-cash":{"usd":1441.49,"usd_market_cap":27030364177.7785},"bitcoin":{"usd":57755,"usd_market_cap":1079976429614.8973},"bitcoin-cash-sv":{"usd":419.63,"usd_market_cap":7855702916.207423}}`)
	jsonStr := string(body)
	log.Printf(jsonStr)
	type CoinData struct {
		USD_Market_Cap float32 `json:"usd_market_cap"`
		USD float32 `json:"usd"`
	}
	type Response struct {
		btc	CoinData `json:"bitcoin"`
		bch CoinData `json:"bitcoin-cash"`
		bsv CoinData `json:"bitcoin-cash-sv"`
	}
	var res Response
	json.Unmarshal([]byte(body), &res)
	fmt.Println(res, *&res)
	coinDataMap := make(map[string]CoinData, len(ids))
	fmt.Println("Coin data map:", coinDataMap)

	// global, globalErr := cg.Global()
	// if globalErr != nil {
	// 	log.Fatal(globalErr)
	// }
	// globalMktCap := global.TotalMarketCap["usd"]
	
	// coinMktCaps := []float64{
	// 	float64((*coinData)["bitcoin"]["usd_market_cap"]),
	// 	float64((*coinData)["bitcoin-cash"]["usd_market_cap"]),
	// 	float64((*coinData)["bitcoin-cash-sv"]["usd_market_cap"]),
	// }
	// coinMktCapsSorted := sort.Reverse(sort.Float64Slice(coinMktCaps))
	
	// fmt.Println("Global market cap:", globalMktCap)
	// fmt.Println("Coin mkt cap:", coinMktCaps)
	// fmt.Println("Coin mkt cap sorted:", coinMktCapsSorted)

}