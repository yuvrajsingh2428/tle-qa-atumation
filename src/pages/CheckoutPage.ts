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
    readonly couponSuccessMsg: Locator;

    constructor(page: Page) {
        this.page = page;

        // Course Cards (using the regex provided by user)
        this.level1Card = page.locator('div').filter({ hasText: /^LEVEL 1BEGINNERLevel 1 Course/ }).first();
        this.level2Card = page.locator('div').filter({ hasText: /^LEVEL 2PRE-INTERMEDIATELevel 2 Course/ }).first();
        this.level3Card = page.locator('div').filter({ hasText: /^LEVEL 3INTERMEDIATELevel 3 Course/ }).first();
        this.level4Card = page.locator('div').filter({ hasText: /^LEVEL 4ADVANCEDLevel 4 Course/ }).first();

        // Buttons
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        // Matches "Proceed to Pay" followed by any amount (e.g., "Proceed to Pay ₹2491")
        this.proceedToPayButton = page.getByRole('button', { name: /^Proceed to Pay/ });

        // Validity
        this.validityDetailsLink = page.getByText('Validity Details');
        this.validityPopupClose = page.locator('path').first();

        // Price & Coupon
        this.priceDetailsHeader = page.getByText('Price Details');
        // Matches total price in the footer button or price details section
        this.totalPrice = page.locator('span').filter({ hasText: '₹' }).last();
        // Use .last() to ensure we select the inner button div, not the parent wrapper
        this.couponChangeButton = page.getByText('Change', { exact: true }).last();
        this.couponApplyButton = page.getByText('Apply', { exact: true }).last();
        this.couponInput = page.getByPlaceholder('Enter coupon code');
        this.couponErrorMsg = page.getByText('Code INVALIDCODE123 is invalid. We’ve automatically applied the best coupon code for you.');
        this.couponSuccessMsg = page.getByText('30% discount applied!');
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
        console.log(`[CheckoutPage] Applying coupon code: ${code}`);

        // 1. Click "Change" if visible
        if (await this.couponChangeButton.isVisible()) {
            console.log('[CheckoutPage] "Change" button found. Clicking...');
            await this.couponChangeButton.click();
        }

        // 2. Wait for "Apply" button to be visible (this confirms we are in edit mode)
        // The user provided locator for Apply is <div class="sc-jRsTgw ctiubJ">Apply</div>
        // Our current locator `getByText('Apply')` should match it, but let's be robust.
        await this.couponApplyButton.waitFor({ state: 'visible', timeout: 5000 });

        // 3. Clear and Fill Coupon Code
        // The input becomes editable after clicking Change.
        await this.couponInput.clear();
        await this.couponInput.fill(code);

        // 4. Click Apply
        console.log('[CheckoutPage] Clicking Apply...');
        await this.couponApplyButton.click();

        // 5. Wait for Error Message (since we are testing invalid code)
        // The user said the error message appears and then the best coupon is auto-applied.
        // We should wait for the error message specifically.
        // Locator provided: <div style="color: var(--tle-red-primary)...">Code <b>...</b> is invalid...</div>
        // Our existing `couponErrorMsg` locator matches "Code ... is invalid".
        await this.couponErrorMsg.waitFor({ state: 'visible', timeout: 5000 });
        console.log('[CheckoutPage] Error message appeared.');
    }
}
