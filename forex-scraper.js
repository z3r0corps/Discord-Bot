const puppeteer = require('puppeteer');

class ForexScraper {
    constructor() {
        this.baseUrl = 'https://www.forexfactory.com/calendar.php';
    }

    async scrapeHighImpactUSDNews() {
        let browser;
        try {
            console.log('🌐 Starting Forex Factory scrape...');
            
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to Forex Factory calendar
            await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            // Wait for the calendar to load
            await page.waitForSelector('.calendar__table', { timeout: 10000 });
            
            // Extract high impact USD news (red folder events)
            const newsData = await page.evaluate(() => {
                const events = [];
                const rows = document.querySelectorAll('.calendar__table tbody tr');
                
                rows.forEach(row => {
                    const currency = row.querySelector('.calendar__currency');
                    const impact = row.querySelector('.calendar__impact');
                    const time = row.querySelector('.calendar__time');
                    const event = row.querySelector('.calendar__event');
                    
                    if (currency && impact && time && event) {
                        const currencyText = currency.textContent.trim();
                        const impactClass = impact.className;
                        const timeText = time.textContent.trim();
                        const eventText = event.textContent.trim();
                        
                        // Check if it's USD and high impact (red folder)
                        if (currencyText === 'USD' && impactClass.includes('calendar__impact--high')) {
                            events.push({
                                time: timeText,
                                event: eventText,
                                currency: currencyText
                            });
                        }
                    }
                });
                
                return events;
            });
            
            console.log(`📊 Found ${newsData.length} high-impact USD events`);
            return newsData;
            
        } catch (error) {
            console.error('❌ Error scraping Forex Factory:', error);
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    formatNewsForDiscord(newsData) {
        if (newsData.length === 0) {
            return {
                title: '📰 Forex News - No High Impact USD Events Today',
                description: 'No high-impact USD news scheduled for today. 💰',
                color: 0x808080, // Gray color for no news
                fields: []
            };
        }

        const fields = newsData.map((item, index) => ({
            name: `🕐 ${item.time} EST`,
            value: item.event,
            inline: false
        }));

        return {
            title: '📰 High Impact USD News Today',
            description: `**${newsData.length}** high-impact USD events scheduled for today (EST times):`,
            color: 0xff0000, // Red color for high impact
            fields: fields,
            footer: {
                text: 'All times are in Eastern Standard Time (EST)'
            }
        };
    }

    async getTodaysNews() {
        try {
            const newsData = await this.scrapeHighImpactUSDNews();
            return this.formatNewsForDiscord(newsData);
        } catch (error) {
            console.error('❌ Error getting today\'s news:', error);
            return {
                title: '❌ Forex News Error',
                description: 'Unable to fetch forex news at this time.',
                color: 0xff0000,
                fields: []
            };
        }
    }
}

module.exports = ForexScraper;
