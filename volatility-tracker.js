const axios = require('axios');

class VolatilityTracker {
    constructor() {
        this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
        this.cache = {
            nq: { data: null, lastUpdate: 0 },
            es: { data: null, lastUpdate: 0 }
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Calculate realized volatility from price data
     * @param {Array} prices - Array of closing prices
     * @returns {number} - Annualized volatility percentage
     */
    calculateVolatility(prices) {
        if (prices.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const dailyReturn = Math.log(prices[i] / prices[i-1]);
            returns.push(dailyReturn);
        }
        
        // Calculate mean return
        const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        
        // Calculate variance
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
        
        // Annualized volatility (assuming daily data)
        const volatility = Math.sqrt(variance * 252) * 100;
        
        return volatility;
    }

    /**
     * Fetch price data from Alpha Vantage
     * @param {string} symbol - Trading symbol (NQ, ES)
     * @returns {Promise<Object>} - Price data
     */
    async fetchPriceData(symbol) {
        try {
            // Map futures symbols to Alpha Vantage format
            const symbolMap = {
                'NQ': '^NDX', // Nasdaq 100 Index as proxy
                'ES': '^GSPC' // S&P 500 Index as proxy
            };
            
            const alphaSymbol = symbolMap[symbol];
            if (!alphaSymbol) {
                throw new Error(`Unsupported symbol: ${symbol}`);
            }

            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${alphaSymbol}&apikey=${this.alphaVantageApiKey}`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            if (data['Error Message']) {
                throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
            }
            
            if (data['Note']) {
                console.log('⚠️ Alpha Vantage API limit reached. Using cached data or fallback.');
                return null;
            }
            
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                console.log(`No daily data found for ${symbol}, trying intraday...`);
                // Fallback to intraday if daily fails
                return await this.fetchIntradayData(symbol);
            }
            
            // Extract closing prices (last 30 days for volatility calculation)
            const prices = Object.keys(timeSeries)
                .slice(0, 30) // Last 30 days
                .map(timestamp => parseFloat(timeSeries[timestamp]['4. close']))
                .filter(price => !isNaN(price));
            
            return {
                symbol: symbol,
                prices: prices,
                latestPrice: prices[0],
                timestamp: new Date().getTime()
            };
            
        } catch (error) {
            console.error(`❌ Error fetching data for ${symbol}:`, error.message);
            return null;
        }
    }

    /**
     * Fallback method for intraday data
     */
    async fetchIntradayData(symbol) {
        try {
            const symbolMap = {
                'NQ': '^NDX',
                'ES': '^GSPC'
            };
            
            const alphaSymbol = symbolMap[symbol];
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${alphaSymbol}&interval=5min&apikey=${this.alphaVantageApiKey}`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            const timeSeries = data['Time Series (5min)'];
            if (!timeSeries) {
                throw new Error('No intraday data found');
            }
            
            const prices = Object.keys(timeSeries)
                .slice(0, 20) // Last 20 5-min intervals (about 100 minutes)
                .map(timestamp => parseFloat(timeSeries[timestamp]['4. close']))
                .filter(price => !isNaN(price));
            
            return {
                symbol: symbol,
                prices: prices,
                latestPrice: prices[0],
                timestamp: new Date().getTime()
            };
            
        } catch (error) {
            console.error(`❌ Error fetching intraday data for ${symbol}:`, error.message);
            return null;
        }
    }

    /**
     * Get data for a specific symbol with caching
     * @param {string} symbol - Trading symbol (NQ, ES)
     * @returns {Promise<number>} - Percentage
     */
    async getVolatility(symbol) {
        const now = new Date().getTime();
        const cached = this.cache[symbol.toLowerCase()];
        
        // Return cached data if still fresh
        if (cached && cached.data && (now - cached.lastUpdate) < this.cacheTimeout) {
            return cached.data.volatility;
        }
        
        // Fetch new data
        const priceData = await this.fetchPriceData(symbol);
        if (!priceData) {
            // Return cached data if available, otherwise return 0
            return cached && cached.data ? cached.data.volatility : 0;
        }
        
        // Calculate volatility
        const volatility = this.calculateVolatility(priceData.prices);
        
        // Update cache
        this.cache[symbol.toLowerCase()] = {
            data: {
                volatility: volatility,
                latestPrice: priceData.latestPrice,
                timestamp: priceData.timestamp
            },
            lastUpdate: now
        };
        
        console.log(`📊 ${symbol}: ${volatility.toFixed(2)}%`);
        return volatility;
    }

    /**
     * Get data for both NQ and ES
     * @returns {Promise<Object>} - Object with NQ and ES data
     */
    async getBothVolatilities() {
        try {
            const [nqData, esData] = await Promise.all([
                this.getVolatility('NQ'),
                this.getVolatility('ES')
            ]);
            
            return {
                NQ: nqData,
                ES: esData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting market data:', error);
            return {
                NQ: 0,
                ES: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get market summary for display
     * @returns {Promise<Object>} - Market summary data
     */
    async getMarketSummary() {
        try {
            const marketStatus = this.getMarketStatus();
            const isMarketOpen = marketStatus.includes('OPEN');
            
            // Only fetch real market data when market is open
            if (isMarketOpen) {
                const marketData = await this.getBothVolatilities();
                
                // If we have real market data, show it
                if (marketData.NQ > 0 || marketData.ES > 0) {
                    return {
                        status: this.formatStatus(marketData),
                        marketStatus: marketStatus,
                        hasRealData: true,
                        volatilities: marketData
                    };
                }
            }
            
            // Market is closed or no data available
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'America/New_York'
            });
            
            // Show market closed status
            return {
                status: isMarketOpen ? `🕐 ${timeStr} EST` : '🔴 Market Closed',
                marketStatus: marketStatus,
                hasRealData: false,
                volatilities: { NQ: 0, ES: 0 }
            };
            
        } catch (error) {
            console.error('❌ Error getting market summary:', error);
            return {
                status: '🔴 Market Closed',
                marketStatus: 'Unknown',
                hasRealData: false,
                volatilities: { NQ: 0, ES: 0 }
            };
        }
    }

    /**
     * Format market data for Discord activity status
     * @param {Object} marketData - Market data object
     * @returns {string} - Formatted status string
     */
    formatStatus(marketData) {
        const nqData = marketData.NQ.toFixed(1);
        const esData = marketData.ES.toFixed(1);
        
        // Create cleaner, more compact display
        if (marketData.NQ > 0 && marketData.ES > 0) {
            return `📊 NQ:${nqData}% ES:${esData}%`;
        } else {
            return `📈 Market Data`;
        }
    }

    /**
     * Get market status (open/closed)
     * @returns {string} - Market status
     */
    getMarketStatus() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;
        
        // Market hours (EST): 9:30 AM - 4:00 PM
        const marketOpen = 9 * 60 + 30; // 9:30 AM
        const marketClose = 16 * 60; // 4:00 PM
        
        // Check if it's a weekday
        const dayOfWeek = now.getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        
        if (isWeekday && currentTime >= marketOpen && currentTime <= marketClose) {
            return '🟢 MARKET OPEN';
        } else {
            return '🔴 MARKET CLOSED';
        }
    }
}

module.exports = VolatilityTracker;
