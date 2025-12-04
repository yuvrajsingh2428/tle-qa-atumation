import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;
    readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.successMessage = page.getByText('Purchase Successful');
    }

    async verifyPurchaseSuccess() {
        await expect(this.successMessage).toBeVisible();
    }
}
