# Real-Time Volatility Tracking Setup

This Discord bot now includes real-time volatility tracking for NQ (Nasdaq 100) and ES (S&P 500 E-mini) futures, displayed in the bot's activity status.

## Features

- **Real-time Volatility Display**: Bot activity shows current NQ and ES volatility percentages
- **Market Status Indicator**: Shows if markets are open or closed
- **Manual Commands**: Users can check volatility with `!volatility` or `!vol` commands
- **Automatic Updates**: Volatility data updates every 5 minutes
- **Caching**: Intelligent caching to respect API rate limits
- **Error Handling**: Graceful fallbacks when API is unavailable

## Setup Instructions

### 1. Get Alpha Vantage API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Generate an API key
4. Free tier allows 25 requests per day (sufficient for 5-minute updates)

### 2. Configure Environment Variables

1. Copy `env.example` to `.env`
2. Add your Alpha Vantage API key:
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

### 3. Restart the Bot

The bot will automatically start tracking volatility once the API key is configured.

## How It Works

### Volatility Calculation

The bot calculates **realized volatility** using:
- Last 60 minutes of price data
- Log returns calculation
- Annualized standard deviation (252 trading days)
- Results displayed as percentage

### Data Sources

- **NQ**: Uses Nasdaq 100 Index (^NDX) as proxy
- **ES**: Uses S&P 500 Index (^GSPC) as proxy
- Data fetched from Alpha Vantage API
- 1-minute interval data for accurate calculations

### Activity Status Format

```
Watching: NQ: 1.2% | ES: 0.8% Volatility
```

### Market Status

- 🟢 **MARKET OPEN**: 9:30 AM - 4:00 PM EST, Monday-Friday
- 🔴 **MARKET CLOSED**: All other times

## Commands

### `!volatility` or `!vol`
Displays detailed volatility information in an embed:
- Current NQ and ES volatility percentages
- Market status (open/closed)
- Last update timestamp
- Color-coded based on volatility levels

## API Rate Limits

### Alpha Vantage Free Tier
- **25 requests per day**
- **5 calls per minute**
- Bot updates every 5 minutes = 288 calls per day (exceeds free limit)

### Solutions
1. **Upgrade to Premium**: $49.99/month for 1200 calls/day
2. **Use Caching**: Bot caches data for 5 minutes
3. **Reduce Frequency**: Change cron schedule to `*/10 * * * *` (every 10 minutes)

## Troubleshooting

### Common Issues

1. **"API limit reached" message**
   - You've exceeded the free tier limit
   - Wait 24 hours or upgrade to premium
   - Bot will use cached data when available

2. **No volatility data showing**
   - Check if API key is set correctly
   - Verify internet connection
   - Check console logs for error messages

3. **Inaccurate volatility readings**
   - Normal during market closed hours
   - Data uses index proxies, not actual futures
   - For exact futures data, consider premium data sources

### Error Messages

- `❌ Error fetching data for NQ/ES`: API connection issue
- `⚠️ Alpha Vantage API limit reached`: Rate limit exceeded
- `❌ Error updating volatility status`: General update failure

## Customization

### Change Update Frequency

Edit `bot.js`, line 179:
```javascript
// Every 10 minutes instead of 5
cron.schedule('*/10 * * * *', async () => {
```

### Add More Symbols

Edit `volatility-tracker.js`, add to symbolMap:
```javascript
const symbolMap = {
    'NQ': '^NDX',
    'ES': '^GSPC',
    'YM': '^DJI',  // Dow Jones
    'RTY': '^RUT'  // Russell 2000
};
```

### Modify Status Format

Edit `volatility-tracker.js`, `formatStatus()` method:
```javascript
formatStatus(volatilities) {
    const nqVol = volatilities.NQ.toFixed(1);
    const esVol = volatilities.ES.toFixed(1);
    return `📊 NQ:${nqVol}% ES:${esVol}%`;
}
```

## Advanced Features

### Premium Data Sources

For more accurate futures data, consider:
- **Interactive Brokers API**: Real futures contracts
- **Quandl**: Professional market data
- **IEX Cloud**: Alternative market data
- **Yahoo Finance API**: Higher rate limits

### Volatility Indicators

The bot can be enhanced with:
- **VIX integration**: Fear index correlation
- **Historical comparisons**: Volatility percentiles
- **Alerts**: High/low volatility notifications
- **Charts**: Visual volatility trends

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your API key is correct
3. Ensure the bot has internet connectivity
4. Check Alpha Vantage service status

For additional help, refer to the main README.md file.
