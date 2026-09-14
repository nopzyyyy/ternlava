const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    let actualType = contentType;
    if (data.length > 4 && data.slice(0, 10).toString().trim().startsWith('<svg')) {
      actualType = 'image/svg+xml';
    }
    const headers = {
      'Content-Type': actualType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    res.writeHead(200, headers);
    res.end(data);
  });
}

function httpsGet(reqUrl, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(reqUrl);
      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          ...customHeaders
        },
        timeout: 8000
      };
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
    } catch (err) {
      reject(err);
    }
  });
}

const apiCache = {};

// Fallback sample data
const SAMPLE_RADAR = [
  { asset: "ETH", name: "Ether", kind: "crypto", priceUsd: 2477.19, change24h: 0.0182, poolTvlUsd: 12400000, lpApr: 0.184, bestFeeTier: 500, funding1h: 0.000118, openInterestUsd: 86400000, established: true, basisSignal: "lp-and-short", lighterMarket: "ETH" },
  { asset: "BTC", name: "Bitcoin", kind: "crypto", priceUsd: 96240.00, change24h: -0.0064, poolTvlUsd: 28500000, lpApr: 0.142, bestFeeTier: 500, funding1h: 0.000092, openInterestUsd: 412000000, established: true, basisSignal: "long-perp", lighterMarket: "BTC" },
  { asset: "SOL", name: "Solana", kind: "crypto", priceUsd: 184.50, change24h: 0.0312, poolTvlUsd: 16200000, lpApr: 0.228, bestFeeTier: 3000, funding1h: 0.000142, openInterestUsd: 94000000, established: true, basisSignal: "lp-and-short", lighterMarket: "SOL" },
  { asset: "NVDA", name: "NVIDIA", kind: "rwa", priceUsd: 182.34, change24h: 0.0241, poolTvlUsd: 3820000, lpApr: 0.317, bestFeeTier: 3000, funding1h: 0.000205, openInterestUsd: 24600000, established: true, basisSignal: "lp-and-short", lighterMarket: "NVDA" },
  { asset: "SPY", name: "S&P 500 ETF", kind: "rwa", priceUsd: 641.12, change24h: 0.0037, poolTvlUsd: 5140000, lpApr: 0.121, bestFeeTier: 500, funding1h: 0.000041, openInterestUsd: 31200000, established: true, basisSignal: "lp-and-short", lighterMarket: "SPY" },
  { asset: "PONS", name: "Pons", kind: "crypto", priceUsd: 0.0412, change24h: 0.1873, poolTvlUsd: 742000, lpApr: 1.42, bestFeeTier: 10000, funding1h: 0.000418, openInterestUsd: 1240000, established: false, basisSignal: "lp-and-short", lighterMarket: "PONS" },
  { asset: "CHUMP", name: "Chump", kind: "crypto", priceUsd: 0.00318, change24h: -0.2214, poolTvlUsd: 118000, lpApr: 3.86, bestFeeTier: 10000, funding1h: null, openInterestUsd: null, established: false, basisSignal: "avoid" },
  { asset: "SHRUB", name: "Shrub", kind: "crypto", priceUsd: 0.1975, change24h: 0.0642, poolTvlUsd: 1960000, lpApr: 0.884, bestFeeTier: 3000, funding1h: 0.000262, openInterestUsd: 4800000, established: true, basisSignal: "lp-and-short", lighterMarket: "SHRUB" },
  { asset: "ROBIN", name: "Robin", kind: "crypto", priceUsd: 12.84, change24h: 0.0415, poolTvlUsd: 6720000, lpApr: 0.226, bestFeeTier: 3000, funding1h: 0.000151, openInterestUsd: 18900000, established: true, basisSignal: "lp-and-short", lighterMarket: "ROBIN" },
  { asset: "AAPL", name: "Apple", kind: "rwa", priceUsd: 246.08, change24h: -0.0092, poolTvlUsd: 2140000, lpApr: 0.147, bestFeeTier: 3000, funding1h: 0.000064, openInterestUsd: 9700000, established: true, basisSignal: "lp-and-short", lighterMarket: "AAPL" },
  { asset: "TSLA", name: "Tesla", kind: "rwa", priceUsd: 412.77, change24h: 0.0328, poolTvlUsd: 2880000, lpApr: 0.268, bestFeeTier: 3000, funding1h: 0.000188, openInterestUsd: 22400000, established: true, basisSignal: "lp-and-short", lighterMarket: "TSLA" },
  { asset: "GOLD", name: "Gold", kind: "rwa", priceUsd: 2684.40, change24h: 0.0011, poolTvlUsd: 1320000, lpApr: 0.064, bestFeeTier: 500, funding1h: 0.000022, openInterestUsd: 6300000, established: true, basisSignal: "neutral", lighterMarket: "GOLD" },
  { asset: "SGOV", name: "0-3 Month T-Bill ETF", kind: "rwa", priceUsd: 100.42, change24h: 0.0001, poolTvlUsd: 4460000, lpApr: 0.038, bestFeeTier: 100, funding1h: null, openInterestUsd: null, established: true, basisSignal: "neutral" }
];

const SAMPLE_VAULTS = [
  { address: "0x2222222222222222222222222222222222220001", name: "ETH Basis Vault", kind: "lp", asset: "WETH", pair: "ETH/USDG", feeTier: 500, apr7d: 0.1842, apr24h: 0.2104, tvlUsd: 1442700, totalAssets: "3420000000000000000", cap: "5000000000000000000" },
  { address: "0x2222222222222222222222222222222222220002", name: "USDG Carry Vault", kind: "lp", asset: "USDG", pair: "ETH/USDG", feeTier: 3000, apr7d: 0.1156, apr24h: 0.0982, tvlUsd: 1124000, totalAssets: "11240000000", cap: "15000000000" },
  { address: "0x2222222222222222222222222222222222220003", name: "NVDA Hedged", kind: "hedged", asset: "WETH", pair: "NVDA/ETH", feeTier: 3000, apr7d: 0.2415, apr24h: 0.2662, tvlUsd: 919600, lpValueUsd: 919600, hedge: { notionalUsd: -4590, unrealizedPnlUsd: 112, equityUsd: 3140, isPaused: false } },
  { address: "0x2222222222222222222222222222222222220004", name: "SPY Hedged", kind: "hedged", asset: "WETH", pair: "SPY/ETH", feeTier: 3000, apr7d: 0.1428, apr24h: 0.1361, tvlUsd: 582000, lpValueUsd: 582000, hedge: { notionalUsd: -2900, unrealizedPnlUsd: 48, equityUsd: 1980, isPaused: false } }
];

const SAMPLE_THESES = [
  { id: "t-1", author: "0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11", positionRef: "v3:18442", market: "ETH", side: "lp", text: "Funding has been positive on ETH for eleven days straight. Running a CURVE range against a 2x short: the LP fees are the free option, the funding is the rent.", ts: Math.floor(Date.now() / 1000) - 7200, pnl: 812.44, votes: 42 },
  { id: "t-2", author: "0x11111111111111111111111111111111111100a1", positionRef: "perp:sim:NVDA:9912", market: "NVDA", side: "long", text: "Tokenized NVDA trades at a discount to the underlying every time the NYSE closes green. Holding into the open.", ts: Math.floor(Date.now() / 1000) - 18000, pnl: 368.28, votes: 56 },
  { id: "t-3", author: "0x11111111111111111111111111111111111100b2", positionRef: "vault:0x2222...0001", market: "NVDA", side: "lp", text: "Parked the sleeve in the NVDA Hedged vault instead of managing the range by hand. 19% with delta stripped out.", ts: Math.floor(Date.now() / 1000) - 32400, pnl: 145.90, votes: 29 },
  { id: "t-4", author: "0x11111111111111111111111111111111111100c3", positionRef: "perp:sim:ETH:9871", market: "ETH", side: "short", text: "OI up 40% on the week with price flat. Someone is offside. Short into the funding reset.", ts: Math.floor(Date.now() / 1000) - 79200, pnl: -212.05, votes: 17 }
];

const LIVE_MARKET_DATA = {
  ETH: { symbol: 'ETH', name: 'Ether', kind: 'crypto', price: 2478.50, change24h: 0.0182, high24h: 2511.40, low24h: 2463.00, funding1h: '0.0118%', poolTvl: '$12.4M', tvSymbol: 'BINANCE:ETHUSDT', logo: '/logos/ETH.png' },
  BTC: { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', price: 96240.00, change24h: -0.0064, high24h: 97100.00, low24h: 95400.00, funding1h: '0.0092%', poolTvl: '$28.5M', tvSymbol: 'BINANCE:BTCUSDT', logo: '/logos/BTC.png' },
  SOL: { symbol: 'SOL', name: 'Solana', kind: 'crypto', price: 102.92, change24h: -0.0158, high24h: 105.10, low24h: 101.30, funding1h: '0.0142%', poolTvl: '$16.2M', tvSymbol: 'BINANCE:SOLUSDT', logo: '/logos/SOL.svg' },
  USDT: { symbol: 'USDT', name: 'Tether USD', kind: 'crypto', price: 1.00, change24h: 0.0002, high24h: 1.001, low24h: 0.999, funding1h: '0.0010%', poolTvl: '$42.1M', tvSymbol: 'BINANCE:USDTUSDC', logo: '/logos/USDT.svg' },
  USDC: { symbol: 'USDC', name: 'USD Coin', kind: 'crypto', price: 1.00, change24h: 0.0000, high24h: 1.000, low24h: 0.999, funding1h: '0.0010%', poolTvl: '$38.4M', tvSymbol: 'BINANCE:USDCUSDT', logo: '/logos/USDC.svg' },
  BNB: { symbol: 'BNB', name: 'BNB Chain', kind: 'crypto', price: 642.50, change24h: 0.0112, high24h: 651.20, low24h: 635.40, funding1h: '0.0085%', poolTvl: '$18.9M', tvSymbol: 'BINANCE:BNBUSDT', logo: '/logos/BNB.svg' },
  XRP: { symbol: 'XRP', name: 'Ripple', kind: 'crypto', price: 2.38, change24h: 0.0345, high24h: 2.44, low24h: 2.29, funding1h: '0.0155%', poolTvl: '$9.4M', tvSymbol: 'BINANCE:XRPUSDT', logo: '/logos/XRP.svg' },
  DOGE: { symbol: 'DOGE', name: 'Dogecoin', kind: 'crypto', price: 0.245, change24h: 0.0210, high24h: 0.258, low24h: 0.238, funding1h: '0.0192%', poolTvl: '$8.2M', tvSymbol: 'BINANCE:DOGEUSDT', logo: '/logos/DOGE.svg' },
  ADA: { symbol: 'ADA', name: 'Cardano', kind: 'crypto', price: 0.785, change24h: -0.0084, high24h: 0.812, low24h: 0.771, funding1h: '0.0098%', poolTvl: '$4.6M', tvSymbol: 'BINANCE:ADAUSDT', logo: '/logos/ADA.svg' },
  AVAX: { symbol: 'AVAX', name: 'Avalanche', kind: 'crypto', price: 28.40, change24h: 0.0145, high24h: 29.20, low24h: 27.80, funding1h: '0.0120%', poolTvl: '$5.7M', tvSymbol: 'BINANCE:AVAXUSDT', logo: '/logos/AVAX.svg' },
  LINK: { symbol: 'LINK', name: 'Chainlink', kind: 'crypto', price: 18.25, change24h: 0.0230, high24h: 18.90, low24h: 17.85, funding1h: '0.0114%', poolTvl: '$6.1M', tvSymbol: 'BINANCE:LINKUSDT', logo: '/logos/LINK.svg' },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA', kind: 'rwa', price: 229.80, change24h: 0.0241, high24h: 232.50, low24h: 226.10, funding1h: '0.0205%', poolTvl: '$3.82M', tvSymbol: 'NASDAQ:NVDA', logo: '/logos/NVDA.svg' },
  SPY: { symbol: 'SPY', name: 'S&P 500 ETF', kind: 'rwa', price: 766.40, change24h: 0.0037, high24h: 769.00, low24h: 763.20, funding1h: '0.0041%', poolTvl: '$5.14M', tvSymbol: 'AMEX:SPY', logo: '/logos/SPY.svg' },
  TSLA: { symbol: 'TSLA', name: 'Tesla', kind: 'rwa', price: 361.20, change24h: 0.0328, high24h: 367.00, low24h: 355.20, funding1h: '0.0188%', poolTvl: '$2.88M', tvSymbol: 'NASDAQ:TSLA', logo: '/logos/TSLA.svg' },
  AAPL: { symbol: 'AAPL', name: 'Apple', kind: 'rwa', price: 315.50, change24h: -0.0092, high24h: 318.50, low24h: 312.80, funding1h: '0.0064%', poolTvl: '$2.14M', tvSymbol: 'NASDAQ:AAPL', logo: '/logos/AAPL.svg' },
  PONS: { symbol: 'PONS', name: 'Pons', kind: 'crypto', price: 0.0412, change24h: 0.0873, high24h: 0.0460, low24h: 0.0380, funding1h: '0.0418%', poolTvl: '$742K', tvSymbol: 'BINANCE:PEPEUSDT', logo: '/logos/PONS.svg' },
  SHRUB: { symbol: 'SHRUB', name: 'Shrub', kind: 'crypto', price: 0.1975, change24h: 0.0442, high24h: 0.2150, low24h: 0.1820, funding1h: '0.0262%', poolTvl: '$1.96M', tvSymbol: 'BINANCE:DOGEUSDT', logo: '/logos/SHRUB.svg' },
  ROBIN: { symbol: 'ROBIN', name: 'Robin', kind: 'crypto', price: 12.84, change24h: 0.0315, high24h: 13.50, low24h: 12.10, funding1h: '0.0151%', poolTvl: '$6.72M', tvSymbol: 'BINANCE:UNIUSDT', logo: '/logos/ROBIN.svg' },
  GOLD: { symbol: 'GOLD', name: 'Gold', kind: 'rwa', price: 2684.40, change24h: 0.0011, high24h: 2695.00, low24h: 2678.00, funding1h: '0.0022%', poolTvl: '$1.32M', tvSymbol: 'TVC:GOLD', logo: '/logos/GOLD.svg' }
};

let isRefreshingPrices = false;
async function refreshLiveMarketPrices() {
  if (isRefreshingPrices) return;
  isRefreshingPrices = true;
  try {
    const cryptoMap = {
      'ETHUSDT': 'ETH',
      'BTCUSDT': 'BTC',
      'SOLUSDT': 'SOL',
      'BNBUSDT': 'BNB',
      'XRPUSDT': 'XRP',
      'DOGEUSDT': 'DOGE',
      'ADAUSDT': 'ADA',
      'AVAXUSDT': 'AVAX',
      'LINKUSDT': 'LINK',
      'UNIUSDT': 'ROBIN',
      'PAXGUSDT': 'GOLD',
      'PEPEUSDT': 'PONS'
    };

    // 1. Batch Binance ticker
    try {
      const symbolsArr = Object.keys(cryptoMap);
      const bRes = await httpsGet(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbolsArr))}`);
      if (bRes.status === 200) {
        const list = JSON.parse(bRes.data);
        if (Array.isArray(list)) {
          for (const item of list) {
            const assetKey = cryptoMap[item.symbol];
            if (assetKey && LIVE_MARKET_DATA[assetKey]) {
              let p = parseFloat(item.lastPrice);
              if (assetKey === 'PONS') p = parseFloat((p * 4000).toFixed(4));
              LIVE_MARKET_DATA[assetKey].price = p;
              LIVE_MARKET_DATA[assetKey].change24h = parseFloat(item.priceChangePercent) / 100;
              LIVE_MARKET_DATA[assetKey].high24h = parseFloat(item.highPrice);
              LIVE_MARKET_DATA[assetKey].low24h = parseFloat(item.lowPrice);
            }
          }
        }
      }
    } catch (e) {
      for (const [binSymbol, assetKey] of Object.entries(cryptoMap)) {
        try {
          const singleRes = await httpsGet(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binSymbol}`);
          if (singleRes.status === 200) {
            const t = JSON.parse(singleRes.data);
            let p = parseFloat(t.lastPrice);
            if (assetKey === 'PONS') p = parseFloat((p * 4000).toFixed(4));
            LIVE_MARKET_DATA[assetKey].price = p;
            LIVE_MARKET_DATA[assetKey].change24h = parseFloat(t.priceChangePercent) / 100;
            LIVE_MARKET_DATA[assetKey].high24h = parseFloat(t.highPrice);
            LIVE_MARKET_DATA[assetKey].low24h = parseFloat(t.lowPrice);
          }
        } catch (err2) {}
      }
    }

    // 2. Fetch Equities from Yahoo Finance
    const equities = ['NVDA', 'SPY', 'TSLA', 'AAPL'];
    for (const eq of equities) {
      try {
        const yRes = await httpsGet(`https://query1.finance.yahoo.com/v8/finance/chart/${eq}?interval=1d&range=1d`);
        if (yRes.status === 200) {
          const yData = JSON.parse(yRes.data);
          const meta = yData.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            const p = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose || meta.previousClose || p;
            LIVE_MARKET_DATA[eq].price = p;
            LIVE_MARKET_DATA[eq].change24h = (p - prev) / prev;
            LIVE_MARKET_DATA[eq].high24h = meta.regularMarketDayHigh || (p * 1.015);
            LIVE_MARKET_DATA[eq].low24h = meta.regularMarketDayLow || (p * 0.985);
          }
        }
      } catch (e) {}
    }

    // 3. Keep SAMPLE_RADAR synchronized
    for (const sr of SAMPLE_RADAR) {
      if (LIVE_MARKET_DATA[sr.asset]) {
        sr.priceUsd = LIVE_MARKET_DATA[sr.asset].price;
        sr.change24h = LIVE_MARKET_DATA[sr.asset].change24h;
      }
    }
  } catch (err) {
  } finally {
    isRefreshingPrices = false;
  }
}

async function handleApiRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const reqUrl = new URL(req.url, 'http://localhost:3000');
  const apiPath = reqUrl.pathname.replace(/^\/api/, '');
  const searchParams = reqUrl.searchParams;

  // Live All Markets Prices Route
  if (apiPath === '/market-prices') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(LIVE_MARKET_DATA));
  }

  // Custom Live Binance Ticker Route
  if (apiPath === '/ticker') {
    const symbol = (searchParams.get('symbol') || 'ETHUSDT').toUpperCase();
    const cleanSym = symbol.replace('USDT', '');
    const binanceSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
    try {
      const bRes = await httpsGet(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
      if (bRes.status === 200) {
        const d = JSON.parse(bRes.data);
        const lastPrice = parseFloat(d.lastPrice);
        const changePct = parseFloat(d.priceChangePercent) / 100;
        const highPrice = parseFloat(d.highPrice);
        const lowPrice = parseFloat(d.lowPrice);
        if (LIVE_MARKET_DATA[cleanSym]) {
          LIVE_MARKET_DATA[cleanSym].price = lastPrice;
          LIVE_MARKET_DATA[cleanSym].change24h = changePct;
          LIVE_MARKET_DATA[cleanSym].high24h = highPrice;
          LIVE_MARKET_DATA[cleanSym].low24h = lowPrice;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          symbol: d.symbol,
          price: lastPrice,
          change24h: changePct,
          high24h: highPrice,
          low24h: lowPrice,
          volume: parseFloat(d.volume)
        }));
      }
    } catch (e) {
      // Fallback
    }
    const assetObj = LIVE_MARKET_DATA[cleanSym] || SAMPLE_RADAR.find(a => a.asset === cleanSym) || SAMPLE_RADAR[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      symbol: `${assetObj.symbol || assetObj.asset}USDT`,
      price: assetObj.price || assetObj.priceUsd,
      change24h: assetObj.change24h,
      high24h: assetObj.high24h || (assetObj.price || assetObj.priceUsd) * 1.025,
      low24h: assetObj.low24h || (assetObj.price || assetObj.priceUsd) * 0.975,
      volume: 124500
    }));
  }

  // Live Binance Klines / Candlesticks Route
  if (apiPath === '/binance-candles') {
    const symbol = (searchParams.get('symbol') || 'ETHUSDT').toUpperCase();
    const interval = searchParams.get('interval') || '1h';
    const limit = searchParams.get('limit') || '300';
    try {
      const bRes = await httpsGet(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      if (bRes.status === 200) {
        const klines = JSON.parse(bRes.data);
        const candles = klines.map(k => ({
          time: Math.floor(k[0] / 1000),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5])
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(candles));
      }
    } catch (e) {
      console.error('Binance klines error:', e.message);
    }
  }

  // Proxy to Railway backend with caching
  const cacheKey = reqUrl.pathname + reqUrl.search;
  const now = Date.now();
  if (apiCache[cacheKey] && (now - apiCache[cacheKey].time < 12000)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(apiCache[cacheKey].data);
  }

  try {
    const railwayUrl = 'https://api-production-47f8.up.railway.app' + apiPath + reqUrl.search;
    const result = await httpsGet(railwayUrl);
    if (result.status >= 200 && result.status < 300) {
      apiCache[cacheKey] = { time: now, data: result.data };
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      return res.end(result.data);
    }
  } catch (err) {
    console.warn(`Upstream error for ${apiPath}: ${err.message}`);
  }

  // Serve graceful fallbacks
  if (apiPath === '/radar') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(SAMPLE_RADAR));
  }
  if (apiPath === '/vaults') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(SAMPLE_VAULTS));
  }
  if (apiPath === '/theses') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(SAMPLE_THESES));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify([]));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const rawRelativePath = parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.slice(1) : parsedUrl.pathname;

  // API handler
  if (pathname.startsWith('/api/') || pathname === '/api') {
    return handleApiRequest(req, res);
  }

  // Landing page
  if (pathname === '/') {
    return serveFile(res, path.join(__dirname, 'index.html'), MIME_TYPES['.html']);
  }

  // App route redirects & clean paths
  if (pathname === '/radar') {
    return serveFile(res, path.join(__dirname, 'pages', 'radar.html'), MIME_TYPES['.html']);
  }

  if (pathname.startsWith('/trade')) {
    const rawAsset = pathname.replace('/trade', '').replace(/\//g, '').toUpperCase();
    const asset = rawAsset || 'ETH';
    const filePath = path.join(__dirname, 'pages', 'trade_eth.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
      if (asset === 'ETH') {
        const headers = {
          'Content-Type': MIME_TYPES['.html'],
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        };
        res.writeHead(200, headers);
        return res.end(html);
      }
      // Determine logo
      const logo = `/logos/${asset}.svg`;
      let customHtml = html
        .replace(/<!-- -->ETH/g, `<!-- -->${asset}`)
        .replace(/\/logos\/ETH\.(png|svg)/g, logo)
        .replace(/"symbol":"ETH"/g, `"symbol":"${asset}"`)
        .replace(/"asset":"ETH"/g, `"asset":"${asset}"`)
        .replace(/>Trade ETH</g, `>Trade ${asset}<`)
        .replace(/title>Trade ETH/g, `title>Trade ${asset}`);
      const headers = {
        'Content-Type': MIME_TYPES['.html'],
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      };
      res.writeHead(200, headers);
      res.end(customHtml);
    });
    return;
  }

  if (pathname === '/portfolio') {
    return serveFile(res, path.join(__dirname, 'pages', 'portfolio.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/yield') {
    return serveFile(res, path.join(__dirname, 'pages', 'yield.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/theses') {
    return serveFile(res, path.join(__dirname, 'pages', 'theses.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/recharge') {
    return serveFile(res, path.join(__dirname, 'pages', 'recharge.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/launch') {
    return serveFile(res, path.join(__dirname, 'pages', 'launch.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/docs' || pathname === '/docs/') {
    res.writeHead(307, { Location: '/docs/overview' + (parsedUrl.search || '') });
    return res.end();
  }

  if (pathname.startsWith('/docs/')) {
    const slug = pathname.replace('/docs/', '').replace(/\/$/, '');
    const docPath = path.join(__dirname, 'pages', 'docs', slug + '.html');
    if (fs.existsSync(docPath)) {
      return serveFile(res, docPath, MIME_TYPES['.html']);
    }
    return serveFile(res, path.join(__dirname, 'pages', 'docs.html'), MIME_TYPES['.html']);
  }

  if (pathname === '/simulate') {
    const simPath = path.join(__dirname, 'pages', 'simulate.html');
    if (fs.existsSync(simPath)) {
      return serveFile(res, simPath, MIME_TYPES['.html']);
    }
    return serveFile(res, path.join(__dirname, 'pages', 'radar.html'), MIME_TYPES['.html']);
  }

  // Fallback dynamic SVG for any missing logo in /logos/
  if (pathname.startsWith('/logos/')) {
    const rawAsset = path.basename(pathname, path.extname(pathname)).toUpperCase();
    const cleanAsset = rawAsset.replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'TOKEN';
    
    // Check if the file actually exists in logos/ or public/logos/
    const possiblePaths = [
      path.join(__dirname, 'logos', path.basename(pathname)),
      path.join(__dirname, 'public', 'logos', path.basename(pathname)),
      path.join(__dirname, relativePath),
      path.join(__dirname, 'public', relativePath)
    ];
    let foundLogo = possiblePaths.find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    if (foundLogo) {
      const ext = path.extname(foundLogo).toLowerCase();
      return serveFile(res, foundLogo, MIME_TYPES[ext] || 'image/svg+xml');
    }

    // Return beautiful dynamic SVG badge
    const colors = ['#ff5500', '#ff7700', '#ffaa00', '#e64a19', '#d84315', '#f57c00', '#ff9100'];
    let hash = 0;
    for (let i = 0; i < cleanAsset.length; i++) hash += cleanAsset.charCodeAt(i);
    const bgCol = colors[Math.abs(hash) % colors.length];
    const fontSize = cleanAsset.length > 4 ? 11 : cleanAsset.length > 3 ? 13 : 15;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="lg_${cleanAsset}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bgCol}" stop-opacity="0.9"/><stop offset="100%" stop-color="#040914" stop-opacity="0.95"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="url(#lg_${cleanAsset})" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/><text x="32" y="38" text-anchor="middle" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="-0.02em">${cleanAsset}</text></svg>`;
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    });
    return res.end(svg);
  }

  // Direct file check (root, public/, or pages/) with both decoded and raw pathname
  const candidates = [
    path.join(__dirname, relativePath),
    path.join(__dirname, 'public', relativePath),
    path.join(__dirname, rawRelativePath),
    path.join(__dirname, 'public', rawRelativePath)
  ];

  for (const directPath of candidates) {
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      const ext = path.extname(directPath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      return serveFile(res, directPath, mime);
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 Not Found</h1><p><a href="/">Return to Tern</a></p>');
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Tern Web Application running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);

  // Start real-time background market price updates
  refreshLiveMarketPrices();
  setInterval(refreshLiveMarketPrices, 3000);
});
