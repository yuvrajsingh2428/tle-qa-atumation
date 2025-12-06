import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly continueWithGoogleButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.continueWithGoogleButton = page.getByRole('button', { name: 'Continue With Google' });
    }

    async clickContinueWithGoogle() {
        await this.continueWithGoogleButton.click();
    }

    // These methods handle the Google Account Popup interactions
    // Note: Interacting with real Google Login pages is often blocked by bot detection.
    async selectGoogleAccount(email: string) {
        // Based on provided HTML: <div data-identifier="nikitawedding1212@gmail.com" ...>
        await this.page.locator(`div[data-identifier="${email}"]`).click();
    }

    async clickGoogleContinue() {
        // Based on provided HTML: <span jsname="V67aGc" class="VfPpkd-vQzf8d">Continue</span>
        // We target the button containing this span
        await this.page.getByRole('button', { name: 'Continue' }).click();
    }
}
