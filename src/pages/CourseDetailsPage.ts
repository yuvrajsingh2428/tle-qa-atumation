import { Page, Locator, expect } from '@playwright/test';

export class CourseDetailsPage {
    readonly page: Page;
    readonly header: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('h1');
    }

    async verifyHeader(expectedText: string) {
        await expect(this.header).toHaveText(expectedText);
    }
}
