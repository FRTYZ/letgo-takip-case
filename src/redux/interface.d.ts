export interface Coin {
    symbol: string;
    askPrice: string;
    askQty: string;
    bidPrice: string;
    bidQty:string;
    closeTime: number;
    count: number;
    firstId: number;
    highPrice: string;
    lastId: string;
    lastPrice: string;
    lastQty: string;
    lowPrice: string;
    openPrice: string;
    openTime: number
    prevClosePrice: string
    priceChange: string;
    priceChangePercent: string
    quoteVolume: string;
    volume: string
    weightedAvgPrice: string
}
  
export interface SelectedCoinState {
    coinData: Coin[]; // Coin verilerini tutan diziyi tanımla
}