import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly coursesLink: Locator;

    constructor(page: Page) {
        this.page = page;
        // Locator for the Courses link in the navbar
        this.coursesLink = page.getByRole('link', { name: 'Courses', exact: true });
    }

    async goto() {
        await this.page.goto('/');
    }

    async clickCourses() {
        await this.coursesLink.click();
    }
}
