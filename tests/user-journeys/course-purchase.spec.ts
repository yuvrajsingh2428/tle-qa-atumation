import { test, expect } from '../../src/fixtures/auth.fixture';
import { HomePage } from '../../src/pages/HomePage';
import { CoursePage } from '../../src/pages/CoursePage';
import { CourseDetailsPage } from '../../src/pages/CourseDetailsPage';

test.describe('User Journey: Course Exploration', () => {

    test('Navigate to Level 1 Course details @smoke', async ({ page, guestUser }) => {
        const homePage = new HomePage(page);
        const coursePage = new CoursePage(page);

        await test.step('Go to home page', async () => {
            await homePage.goto();
        });

        await test.step('Navigate to Courses page', async () => {
            await homePage.clickCourses();
        });

        // Handle the new tab creation
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'), // Wait for the new page to be created
            coursePage.clickExploreNow('1'), // This action triggers the new tab
        ]);

        await test.step('Verify new tab content', async () => {
            // Initialize the POM for the new page
            const courseDetailsPage = new CourseDetailsPage(newPage);
            // Wait for the new page to load
            await newPage.waitForLoadState();
            // Verify the header
            await courseDetailsPage.verifyHeader('Level 1 Self-Paced');
        });
    });
});
