import { Page, Locator, expect } from '@playwright/test';

export class CourseDetailsPage {
    readonly page: Page;
    readonly header: Locator;
    readonly enrollNowButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('h1');
        // There are two "Enroll Now" buttons. We can target the first one or the one in the pricing card.
        // Let's target the one in the pricing card as it's more specific to the purchase action.
        // The second button has width: 100% in the style, which is a good differentiator, 
        // or we can look for the one inside the card container.
        // Using the text and the specific container class or style is safer.
        this.enrollNowButton = page.locator('.sc-fPHcVk').getByRole('button', { name: 'Enroll Now' });
    }

    async verifyHeader(expectedText: string) {
        await expect(this.header).toHaveText(expectedText);
    }

    async clickEnrollNow() {
        await this.enrollNowButton.click();
    }
}
