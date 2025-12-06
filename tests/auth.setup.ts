import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('/');

    // 2. Pause the script to allow manual login
    // The user should:
    //    a. Click Login
    //    b. Click Continue with Google
    //    c. Enter credentials and complete 2FA if needed
    //    d. Wait until redirected back to the app and logged in
    //    e. Click the "Resume" button in the Playwright Inspector
    console.log('----------------------------------------------------------------');
    console.log('🔴 ACTION REQUIRED: Manually log in to the application.');
    console.log('1. Interact with the browser window to log in via Google.');
    console.log('2. Once you are logged in and see the dashboard, click the "Resume" (Play) button in the Playwright Inspector window.');
    console.log('----------------------------------------------------------------');

    await page.pause();

    // 3. Verify authentication state (adjust selector as needed for your app)
    // We check for an element that only exists when logged in
    await expect(page.getByRole('button', { name: 'My Learnings' })).toBeVisible({ timeout: 10000 });

    // 4. Save the storage state (cookies, local storage)
    await page.context().storageState({ path: authFile });
});
