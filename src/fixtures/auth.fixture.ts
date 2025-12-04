import { test as base } from '@playwright/test';

type AuthFixtures = {
    loggedInUser: void;
    guestUser: void;
};

export const test = base.extend<AuthFixtures>({
    loggedInUser: async ({ page }, use) => {
        // Setup: Login flow would go here (e.g., set cookies or perform UI login)
        console.log('Setting up logged-in user context...');
        // await page.goto('/login');
        // await page.fill('#username', 'user');
        // await page.fill('#password', 'pass');
        // await page.click('#login');
        await use();
    },
    guestUser: async ({ page }, use) => {
        // Setup: Ensure clean state for guest
        console.log('Setting up guest user context...');
        await use();
    },
});

export { expect } from '@playwright/test';
