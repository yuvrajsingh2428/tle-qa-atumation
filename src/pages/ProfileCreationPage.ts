import { Page, Locator } from '@playwright/test';

export class ProfileCreationPage {
    readonly page: Page;
    readonly skipButton: Locator;
    readonly submitButton: Locator;
    readonly collegeInput: Locator;
    readonly countryInput: Locator;
    readonly degreeInput: Locator;
    readonly yearInput: Locator;
    readonly languageInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.skipButton = page.getByRole('button', { name: 'Skip' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });

        this.collegeInput = page.getByPlaceholder('College Name');
        // React Select inputs are tricky. We target the input inside the container.
        this.countryInput = page.locator('#react-select-2-input');
        this.degreeInput = page.getByPlaceholder('Degree Pursuing (Ex: BTech)');
        this.yearInput = page.getByPlaceholder('Current Year (Ex: 3)');
        this.languageInput = page.locator('#react-select-3-input');
    }

    async clickSkip() {
        await this.skipButton.click();
    }

    async fillProfileDetails(details: {
        college: string,
        country: string,
        degree: string,
        year: string,
        language: string
    }) {
        // Fill College
        await this.collegeInput.fill(details.college);
        // Select first option from dropdown if it appears
        await this.page.locator('li').first().click();

        // Fill Country (React Select)
        await this.countryInput.fill(details.country);
        await this.page.keyboard.press('Enter');

        // Fill Degree
        await this.degreeInput.fill(details.degree);

        // Fill Year
        await this.yearInput.fill(details.year);

        // Fill Language (React Select)
        await this.languageInput.fill(details.language);
        await this.page.keyboard.press('Enter');
    }

    async clickSubmit() {
        await this.submitButton.click();
    }
}
