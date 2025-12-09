import { test, expect } from '../../src/fixtures/auth.fixture';
import { HomePage } from '../../src/pages/HomePage';
import { CoursePage } from '../../src/pages/CoursePage';
import { CourseDetailsPage } from '../../src/pages/CourseDetailsPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { PaymentPage } from '../../src/pages/PaymentPage';

test.describe('User Journey: Course Exploration', () => {

    test('Navigate to Level 1 Course details @smoke', async ({ page, guestUser }) => {
        const homePage = new HomePage(page);
        const coursePage = new CoursePage(page);

        await test.step('Go to home page', async () => {
            await homePage.goto();
        });

        // Login is now handled by the 'setup' project and storageState.
        // We start the test already logged in.

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

            // Click Enroll Now
            await courseDetailsPage.clickEnrollNow();

            // Initialize Checkout Page
            console.log('Initializing CheckoutPage...');
            const checkoutPage = new CheckoutPage(newPage);
            await newPage.waitForLoadState('networkidle');
            console.log('Waited for networkidle on CheckoutPage.');

            // Click Proceed to Pay
            console.log('Clicking Proceed to Pay...');
            await checkoutPage.proceedToPayButton.click();
            console.log('Clicked Proceed to Pay.');

            // Initialize Payment Page (Razorpay)
            console.log('Initializing PaymentPage...');
            const paymentPage = new PaymentPage(newPage);

            // Verify Razorpay Modal appears
            console.log('Verifying Razorpay Modal...');
            await paymentPage.verifyModalLoaded();
            console.log('Razorpay Modal verified.');

            // Close the modal to finish the test cleanly
            console.log('Closing Razorpay Modal...');
            await paymentPage.close();
            console.log('Razorpay Modal closed.');
        });
    });
});
