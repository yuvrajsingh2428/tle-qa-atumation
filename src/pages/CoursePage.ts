import { Page, Locator } from '@playwright/test';

export class CoursePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Helper to get the explore button for a specific level ID
    private getExploreButton(levelId: string): Locator {
        // The user structure shows <div id="1"> ... <button>Explore Now</button>
        return this.page.locator(`div[id="${levelId}"]`).getByRole('button', { name: 'Explore Now' });
    }

    async clickExploreNow(levelId: string) {
        // This action triggers a new tab, so the test needs to handle the popup event.
        // We just perform the click here.
        await this.getExploreButton(levelId).click();
    }
}
