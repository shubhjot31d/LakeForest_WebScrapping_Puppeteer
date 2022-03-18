//Laoding dependencies
const puppeteer = require('puppeteer')
const random_useragent =require('random-useragent')
const fs = require('fs')
const {url} = require('./config')
const { error } = require('console')


;(async() => {
    //Launching Browser
    const browser = await puppeteer.launch({headless: true , slowMo: 10 })
    const page = await browser.newPage()

    //Setup Browser
    await page.setDefaultTimeout(20000)
    await page.setViewport({width: 1200,height:800})
    await page.setUserAgent(random_useragent.getRandom())

    // check if required page is loaded
    await page.goto(url)
    await page.waitForSelector('#sidebar-first')

    //selecting the category column
    const selector = '#block-aba-product-browse-ababook-browse > div > div > ul'

    //selecting a category to scrap book from it 
    await page.click(`${selector} > li:nth-child(10) > a`)

    //wating for unique selector to browse for the selcted category of books
    await page.waitForSelector('#block-aba-product-browse-ababook-browse > div > a')

    //Selecting the books table selector having books on that page
    const bookTableSelector  = '#block-system-main > div > div > div.view-content > table > tbody'

    //Slecting page index slector for retreiving current page number
    const pageSelector = '#block-system-main > div > div > div.item-list > ul > li.pager-current';

    //creating the logger for storing the records of 10 books
    const logger = fs.createWriteStream('scrappedBooksData.txt',{flags: 'a'})

    //Function for visiting a page and scraapping the data for 2 random books form it
    const pageScrapper = async (pageNumber) => {
        const newPage = await browser.newPage();
        await newPage.goto(`https://www.lakeforestbookstore.com/browse/book/ART057000?page=${pageNumber-1}`)
        await newPage.waitForSelector(`${pageSelector}`)

        //For Loop for selecting the 2 books (Note:Here we are scrapping book number , bookName , Author and price of the book)
        for(let row=2;row<=2;row++){
            for(let col=1;col<=2;col++){
              const boxSelector = `${tableSelector} > tr.row-${row} > td.col-${col}`;
              const bookName =  await newPage.$eval(`${boxSelector} > div:nth-child(2) > span` > a,element=>element.innerText);
              const authorName =  await newPage.$eval(`${boxSelector} > div:nth-child(3) > span > a`,element=>element.innerText);
              const price = await newPage.$eval(`${boxSelector} > div:nth-child(4) > span`,element=>element.innerText);
              //logger.write(${(row-1)*3+col+(pageNo-1)*12}),
              logger.write(`${bookName} - ${authorName} - ${price}`);
            }
          }

        //Finally awaiting for closing the page
        await newPage.close();
        }

    //Iterating through 5 pages thereby selecting 2 books form each
     for(let page=1;page<=5;page++){
        await pageScrapper(page);
      }
    // closing logger file
    logger.close()

    // Close Browser
    await browser.close()


})().catch(error =>{
    console.log(error_occurred)
    process.exit(1)
});




