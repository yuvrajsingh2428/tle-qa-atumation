import { test, expect } from '@playwright/test';

test.describe('Responsive Design Learning', () => {

    // Example 1: Conditional logic inside a test
    test('Handle different navigation menus', async ({ page, isMobile }) => {
        await page.goto('/');

        if (isMobile) {
            console.log('Running mobile specific flow...');
            // Mobile often has a hamburger menu
            // await page.getByRole('button', { name: 'Menu' }).click();
            // await page.getByRole('link', { name: 'Courses' }).click();
        } else {
            console.log('Running desktop specific flow...');
            // Desktop usually has visible links
            // await page.getByRole('link', { name: 'Courses' }).click();
        }

        // Common assertion after navigation
        // await expect(page).toHaveURL(/.*courses/);
    });

    // Example 2: Skipping tests based on device
    test('Desktop only feature', async ({ page, isMobile }) => {
        test.skip(isMobile, 'This feature is not available on mobile');

        console.log('This runs only on desktop');
    });

    test('Mobile only feature', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'This feature is only for mobile');

        console.log('This runs only on mobile');
    });
});
