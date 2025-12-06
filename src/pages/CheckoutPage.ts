import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;

    // Course Cards
    readonly level1Card: Locator;
    readonly level2Card: Locator;
    readonly level3Card: Locator;
    readonly level4Card: Locator;

    // General Locators
    readonly continueButton: Locator;
    readonly proceedToPayButton: Locator;
    readonly validityDetailsLink: Locator;
    readonly validityPopupClose: Locator;

    // Cart & Price Locators
    readonly priceDetailsHeader: Locator;
    readonly totalPrice: Locator;
    readonly couponChangeButton: Locator;
    readonly couponApplyButton: Locator;
    readonly couponInput: Locator;
    readonly couponErrorMsg: Locator;

    constructor(page: Page) {
        this.page = page;

        // Course Cards (using the regex provided by user)
        this.level1Card = page.locator('div').filter({ hasText: /^LEVEL 1BEGINNERLevel 1 Course/ }).first();
        this.level2Card = page.locator('div').filter({ hasText: /^LEVEL 2PRE-INTERMEDIATELevel 2 Course/ }).first();
        this.level3Card = page.locator('div').filter({ hasText: /^LEVEL 3INTERMEDIATELevel 3 Course/ }).first();
        this.level4Card = page.locator('div').filter({ hasText: /^LEVEL 4ADVANCEDLevel 4 Course/ }).first();

        // Buttons
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.proceedToPayButton = page.getByRole('button', { name: 'Proceed to Pay' });

        // Validity
        this.validityDetailsLink = page.getByText('Validity Details');
        this.validityPopupClose = page.locator('path').first();

        // Price & Coupon
        this.priceDetailsHeader = page.getByText('Price Details');
        // Matches total price in the footer button or price details section
        this.totalPrice = page.locator('span').filter({ hasText: '₹' }).last();
        this.couponChangeButton = page.locator('div').filter({ hasText: /^Change$/ }).first();
        this.couponApplyButton = page.getByText('Apply');
        this.couponInput = page.getByPlaceholder('Enter coupon code');
        this.couponErrorMsg = page.getByText('Code ass is invalid. We’ve');
    }

    // Helper to get "Add" button for a specific card
    getAddButton(card: Locator) {
        // The button text is "+ Add"
        return card.getByRole('button', { name: '+ Add' });
    }

    // Helper to get "Remove" button for a specific card
    getRemoveButton(card: Locator) {
        return card.getByText('Remove');
    }

    async addCourse(level: '1' | '2' | '3' | '4') {
        const card = this.getCard(level);
        await this.getAddButton(card).click();
    }

    async removeCourse(level: '1' | '2' | '3' | '4') {
        const card = this.getCard(level);
        await this.getRemoveButton(card).click();
    }

    getCard(level: '1' | '2' | '3' | '4') {
        switch (level) {
            case '1': return this.level1Card;
            case '2': return this.level2Card;
            case '3': return this.level3Card;
            case '4': return this.level4Card;
            default: throw new Error('Invalid Level');
        }
    }

    async verifyBundlingUnavailable(level: '1' | '2' | '3' | '4') {
        const card = this.getCard(level);
        const addButton = this.getAddButton(card);

        // Check if button is disabled or has specific style indicating unavailability
        // User mentioned "Bundling Unavailable" on hover or cursor: not-allowed
        await expect(addButton).toHaveCSS('cursor', 'not-allowed');
    }

    async checkValidityDetails() {
        await this.validityDetailsLink.click();
        const content = await this.page.locator('div[role="dialog"]').textContent();
        return content;
    }

    async closeValidityPopup() {
        await this.page.mouse.click(10, 10);
    }

    async applyCoupon(code: string) {
        // If "Change" button is visible, it means a coupon is already applied.
        // We must click it to make the input editable.
        if (await this.couponChangeButton.isVisible()) {
            await this.couponChangeButton.click();
            // Wait for the input to become editable (not readonly)
            await this.couponInput.waitFor({ state: 'visible' });
            await this.page.waitForTimeout(1000); // Small stability wait
        }

        // Clear existing text if any
        await this.couponInput.clear();
        await this.couponInput.fill(code);
        await this.couponApplyButton.click();
        await this.page.waitForTimeout(1000); // Wait for application logic
    }
}
