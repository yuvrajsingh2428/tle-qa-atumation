import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://staging-rq8v6p5n.tle-eliminators.com/';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: BASE_URL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        // Setup project for Authentication
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
            use: {
                // Use Google Chrome to minimize "browser not secure" errors during manual login
                channel: 'chrome',
                headless: false,
                launchOptions: {
                    args: ['--disable-blink-features=AutomationControlled'],
                },
            },
            // Long timeout to allow for manual interaction
            timeout: 5 * 60 * 1000,
        },
        // Test projects that use the saved auth state
        {
            name: 'chromium-desktop',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
        },
        {
            name: 'chromium-mobile',
            use: {
                ...devices['Pixel 5'],
                storageState: 'playwright/.auth/user.json',
            },
        },
    ],
});
