import { test, expect } from '../../src/fixtures/auth.fixture';
import { HomePage } from '../../src/pages/HomePage';
import { CoursePage } from '../../src/pages/CoursePage';
import { CourseDetailsPage } from '../../src/pages/CourseDetailsPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { COURSE_DATA } from '../../src/data/courseData';

test.describe('Checkout Process & Bundling', () => {

    test('Verify Course Bundling, Validity and Pricing', async ({ page }) => {
        const homePage = new HomePage(page);
        const coursePage = new CoursePage(page);
        const checkoutPage = new CheckoutPage(page);

        // 1. Navigate to Checkout (Level 1)
        await homePage.goto();
        await homePage.clickCourses();

        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            coursePage.clickExploreNow('1'),
        ]);

        const courseDetailsPage = new CourseDetailsPage(newPage);
        await newPage.waitForLoadState();
        await courseDetailsPage.clickEnrollNow();

        // Now on Checkout Page (newPage context)
        const checkout = new CheckoutPage(newPage);

        // 2. Verify Single Course Validity
        await test.step('Verify Single Course Validity', async () => {
            await checkout.validityDetailsLink.click();
            await expect(newPage.getByText(`Content Validity${COURSE_DATA.level1.validity.content}`)).toBeVisible();
            await expect(newPage.getByText(`Doubt Support Validity${COURSE_DATA.level1.validity.doubtSupport}`)).toBeVisible();
            // Close popup
            await newPage.locator('body').click({ position: { x: 10, y: 10 } });
        });

        // 3. Verify Bundling Logic
        await test.step('Verify Bundling Logic', async () => {
            // L1 is in cart. L2 should be addable.
            await expect(checkout.getAddButton(checkout.level2Card)).toBeVisible();

            // Add Level 2
            await checkout.addCourse('2');

            // Verify L1 + L2 in cart
            await expect(checkout.getRemoveButton(checkout.level1Card)).toBeVisible();
            await expect(checkout.getRemoveButton(checkout.level2Card)).toBeVisible();

            // Verify L3 cannot be added (Bundling Unavailable)
            await checkout.verifyBundlingUnavailable('3');
            await checkout.verifyBundlingUnavailable('4');
        });

        // 4. Verify Bundle Validity
        await test.step('Verify Bundle Validity', async () => {
            await checkout.validityDetailsLink.click();
            // Check for updated validity
            await expect(newPage.getByText(`Doubt Support Validity${COURSE_DATA.bundle_l1_l2.validity.doubtSupport}`)).toBeVisible();
            await newPage.locator('body').click({ position: { x: 10, y: 10 } });
        });

        // 5. Proceed to Second Checkout Page (Price Verification)
        await test.step('Verify Price Details', async () => {
            await checkout.continueButton.click();

            // Verify Total Price for Bundle
            await expect(checkout.priceDetailsHeader).toBeVisible();

            // Check if L1 and L2 prices are displayed
            // Note: The exact text matching might need adjustment based on how multiple items are listed
            // But we can check for the total price logic if we knew the bundle calculation
        });

        // 6. Verify Coupon Logic
        await test.step('Verify Coupon Logic', async () => {
            // Apply Invalid Coupon
            await checkout.applyCoupon(COURSE_DATA.coupons.invalid);
            await expect(checkout.couponErrorMsg).toBeVisible();

            // Verify it reverts to best coupon (or check total price again)
        });
    });
});
