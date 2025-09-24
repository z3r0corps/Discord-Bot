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
            console.log('🌐 Navigating to:', this.baseUrl);
            await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
            
            // Get page title for debugging
            const pageTitle = await page.title();
            console.log('📄 Page title:', pageTitle);
            
            // Wait a bit longer for dynamic content to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Wait for the calendar to load - try multiple selectors
            const calendarSelectors = ['.calendar__table', '.ff-calendar-table', 'table.calendar', '.calendar-table', 'table'];
            let calendarLoaded = false;
            for (const selector of calendarSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    calendarLoaded = true;
                    break;
                } catch (e) {
                    // Try next selector
                }
            }
            
            if (!calendarLoaded) {
                console.log('⚠️ Calendar table not found, proceeding anyway...');
            }
            
            // Debug: Get page content to see what we're working with
            const pageContent = await page.content();
            console.log('📄 Page content length:', pageContent.length);
            
            // Look for USD and High impact mentions in the page
            const usdMatches = pageContent.match(/USD/gi);
            const highMatches = pageContent.match(/high/gi);
            console.log(`📊 Found ${usdMatches ? usdMatches.length : 0} USD mentions`);
            console.log(`📊 Found ${highMatches ? highMatches.length : 0} "high" mentions`);
            
            // Extract high impact USD news (red folder events)
            const newsData = await page.evaluate(() => {
                const events = [];
                const rows = document.querySelectorAll('tr[data-event-id]');
                
                rows.forEach(row => {
                    try {
                        // Look for impact icons - high impact is usually red
                        const impactCell = row.querySelector('.calendar__impact');
                        if (impactCell) {
                            const impactIcon = impactCell.querySelector('span[class*="icon--ff-impact"]');
                            if (impactIcon) {
                                const iconClass = impactIcon.className;
                                const isHighImpact = iconClass.includes('red') || 
                                                   iconClass.includes('high') ||
                                                   impactIcon.getAttribute('title')?.toLowerCase().includes('high');
                                
                                if (isHighImpact) {
                                    const currencyCell = row.querySelector('.calendar__currency span');
                                    const timeCell = row.querySelector('.calendar__time span');
                                    const eventCell = row.querySelector('.calendar__event a, .calendar__event span');
                                    
                                    if (currencyCell && timeCell && eventCell) {
                                        const currency = currencyCell.textContent.trim();
                                        const time = timeCell.textContent.trim();
                                        const event = eventCell.textContent.trim();
                                        
                                        if (currency === 'USD' && event && time) {
                                            events.push({
                                                time: time,
                                                event: event,
                                                currency: currency
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Skip this row
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
                description: 'No high-impact USD news scheduled for today. Check back tomorrow for major economic releases! 💰',
                color: 0x808080, // Gray color for no news
                fields: [],
                footer: {
                    text: 'The bot checks Forex Factory daily for high-impact USD events'
                }
            };
        }

        const fields = newsData.map((item, index) => ({
            name: `🔴 ${item.time} EST`,
            value: item.event,
            inline: false
        }));

        return {
            title: '📰 High Impact USD News Today',
            description: `**${newsData.length}** high-impact USD events scheduled for today:`,
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
