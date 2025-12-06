import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly coursesLink: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Locator for the Courses link in the navbar
        this.coursesLink = page.getByRole('link', { name: 'Courses', exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login / Register' });
    }

    async clickLogin() {
        await this.loginButton.click();
    }

    async goto() {
        await this.page.goto('/');
    }

    async clickCourses() {
        await this.coursesLink.click();
    }
}
