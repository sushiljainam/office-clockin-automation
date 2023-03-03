import puppeteer, { Page } from 'puppeteer'
import dotenv from 'dotenv'
import { indexOf, toLower } from 'ramda'
dotenv.config()

const { GAMIO_GREYTHR_UNAME, GAMIO_GREYTHR_PASS } = process.env

const clickButtonWithLabel = async (page: Page, label: string) => {
    const buttons = await page.$$('button')
    console.log('await page.$$(\'button\')')
    for (const button of buttons) {
        const buttonText = await button.toString()
        console.log('await button.toString()', button)
        await button.click()
        console.log('await button.click()')
        if (indexOf(toLower(label), toLower(buttonText)) > 0) {
            console.log('indexOf(toLower(label), toLower(buttonText)) > 0')
            break
        }
    }
    // throw new Error(`buttton with label (${label}) not found`)
}

const login = async (page: Page) => {
    await page.goto('https://gamio.greythr.com/', { waitUntil: 'networkidle0' })
    console.log('await page.goto(\'https://gamio.greythr.com/\', { waitUntil: \'networkidle0\' })')

    const usernameSelector = 'input[name="username"]'
    const passwordSelector = 'input[name="password"]'
    const loginButtonLabel = 'Log in'

    await page.waitForSelector(usernameSelector)
    await page.waitForSelector(passwordSelector)

    // await page.waitForNavigation(),
    // console.log('await page.waitForNavigation(),')
    await page.type(usernameSelector, GAMIO_GREYTHR_UNAME || '')
    console.log('await page.type(usernameSelector, GAMIO_GREYTHR_UNAME || \'\')')
    await page.type(passwordSelector, GAMIO_GREYTHR_PASS || '')
    console.log('await page.type(passwordSelector, GAMIO_GREYTHR_PASS || \'\')')

    await Promise.all([
        page.waitForNavigation(),
        clickButtonWithLabel(page, loginButtonLabel),
    ])
    console.log('await page.waitForNavigation(),')
    console.log('await Promise.all([')

    await page.waitForSelector('#dashboardContainer')
    console.log('await page.waitForSelector(\'#dashboardContainer\')')
}

const signOut = async (page: Page) => {
    await page.click('#userWidgetDropdownBtn')
    console.log('await page.click(\'#userWidgetDropdownBtn\')')
    await page.click('#logoutLink')
    console.log('await page.click(\'#logoutLink\')')
    await page.waitForNavigation()
    console.log('await page.waitForNavigation()')
};

(async () => {
    const browser = await puppeteer.launch({ headless: false })
    console.log('await puppeteer.launch({ headless: false })')

    try {
        const page = await browser.newPage()
        console.log('await browser.newPage()')
        await login(page)
        console.log('await login(page)')

        const shouldSignOut = process.argv[2] === 'signout'
        if (shouldSignOut) {
            await signOut(page)
            console.log('await signOut(page)')
        } else {
            await page.click('#signInButton')
            console.log('await page.click(\'#signInButton\')')
        }
    } finally {
        await browser.close()
        console.log('await browser.close()')
    }
})()