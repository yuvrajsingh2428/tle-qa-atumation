import { test, expect } from '../../src/fixtures/auth.fixture';
import { HomePage } from '../../src/pages/HomePage';
import { CoursePage } from '../../src/pages/CoursePage';
import { CourseDetailsPage } from '../../src/pages/CourseDetailsPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { PaymentPage } from '../../src/pages/PaymentPage';
import { COURSE_DATA } from '../../src/data/courseData';

test.describe('Checkout Process & Bundling', () => {

    test('Verify Course Bundling, Validity and Pricing', async ({ page }) => {
        test.setTimeout(150_000);
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
        await newPage.waitForLoadState('networkidle'); // Wait for page to be fully stable

        // Now on Checkout Page (newPage context)
        const checkout = new CheckoutPage(newPage);

        // 2. Verify Single Course Validity
        await test.step('Verify Single Course Validity', async () => {
            console.log('[Test] Verifying Single Course Validity...');
            await checkout.validityDetailsLink.click();
            await expect(newPage.getByText(`Content Validity${COURSE_DATA.level1.validity.content}`)).toBeVisible();
            await expect(newPage.getByText(`Doubt Support Validity${COURSE_DATA.level1.validity.doubtSupport}`)).toBeVisible();
            console.log('[Test] Single Course Validity Verified.');
            // Close popup
            await newPage.locator('body').click({ position: { x: 10, y: 10 } });
        });

        // 3. Verify Bundling Logic
        await test.step('Verify Bundling Logic', async () => {
            console.log('[Test] Verifying Bundling Logic...');
            // L1 is in cart. L2 should be addable.
            await expect(checkout.getAddButton(checkout.level2Card)).toBeVisible();

            // Add Level 2
            console.log('[Test] Adding Level 2 Course...');
            await checkout.addCourse('2');

            // Verify L1 + L2 in cart
            await expect(checkout.getRemoveButton(checkout.level1Card)).toBeVisible();
            await expect(checkout.getRemoveButton(checkout.level2Card)).toBeVisible();
            console.log('[Test] Level 1 and Level 2 are in cart.');

            // Verify L3 cannot be added (Bundling Unavailable)
            console.log('[Test] Verifying Level 3 cannot be added...');
            await checkout.verifyBundlingUnavailable('3');
            await checkout.verifyBundlingUnavailable('4');
        });

        // 4. Verify Bundle Validity
        await test.step('Verify Bundle Validity', async () => {
            console.log('[Test] Verifying Bundle Validity...');
            await checkout.validityDetailsLink.click();
            // Check for updated validity
            await expect(newPage.getByText(`Doubt Support Validity${COURSE_DATA.bundle_l1_l2.validity.doubtSupport}`)).toBeVisible();
            console.log('[Test] Bundle Validity Verified.');
            await newPage.locator('body').click({ position: { x: 10, y: 10 } });
        });

        // 5. Proceed to Second Checkout Page (Price Verification)
        await test.step('Verify Price Details', async () => {
            console.log('[Test] Proceeding to Price Details...');
            await checkout.continueButton.click();

            // Verify Total Price for Bundle
            await expect(checkout.priceDetailsHeader).toBeVisible();
            console.log('[Test] Price Details Header Visible.');
        });

        // 6. Verify Coupon Logic
        await test.step('Verify Coupon Logic', async () => {
            console.log('[Test] Verifying Coupon Logic...');
            // Apply Invalid Coupon
            await checkout.applyCoupon(COURSE_DATA.coupons.invalid);
            await expect(checkout.couponErrorMsg).toBeVisible();
            console.log('[Test] Invalid Coupon Error Verified.');

            // Verify Reversion to Best Coupon
            console.log('[Test] Verifying Reversion to Best Coupon...');
            await expect(checkout.couponChangeButton).toBeVisible();
            await expect(checkout.couponInput).toHaveValue('ALUMNI30');
            await expect(checkout.couponInput).toHaveAttribute('readonly', '');
            await expect(checkout.couponSuccessMsg).toBeVisible();
            console.log('[Test] Coupon Reversion Verified.');
        });

        // 7. Verify Payment Flow
        await test.step('Verify Payment Flow', async () => {
            console.log('[Test] Verifying Payment Flow...');
            const paymentPage = new PaymentPage(newPage);

            // Click Proceed to Pay
            console.log('[Test] Clicking Proceed to Pay...');
            await checkout.proceedToPayButton.click();

            // Verify Razorpay Modal
            console.log('[Test] Waiting for Razorpay Modal...');
            await paymentPage.verifyModalLoaded();
            console.log('[Test] Razorpay Modal Loaded.');

            // Verify Merchant Name
            await expect(paymentPage.merchantName).toContainText('TLE Eliminators');
            console.log('[Test] Merchant Name Verified: TLE Eliminators');

            // Verify Payment Options
            await expect(paymentPage.upiOption).toBeVisible();
            await expect(paymentPage.cardOption).toBeVisible();
            await expect(paymentPage.emiOption).toBeVisible();
            await expect(paymentPage.netbankingOption).toBeVisible();
            console.log('[Test] Payment Options (UPI, Card, EMI, Netbanking) Verified.');

            // Complete Payment
            // console.log('[Test] Completing Payment via Card...');
            // const cardSuccess = await paymentPage.payWithCard({
            //     number: '0000000000000000',
            //     expiry: '12/30',
            //     cvv: '123',
            //     name: 'Yuvraj Singh'
            // });

            // if (!cardSuccess) {
            //     await newPage.waitForTimeout(10000);
            //     console.log('[Test] Card route did not complete, falling back to UPI...');
            //     await paymentPage.payWithUpi('testuser@okhdfcbank');
            // }
            await paymentPage.payWithUpi('testuser@okhdfcbank');

           // 8. Wait on TLE page until Payment Successful
console.log('[Test] Waiting for Payment Successful message on TLE page...');
await expect(newPage.getByText('Payment Successful!')).toBeVisible({ timeout: 60000 });
console.log('[Test] Payment Successful message visible.');

// 9. Verify enrolled course text
await expect(
  newPage.getByText("You’ve successfully enrolled in")
).toBeVisible({ timeout: 60000 });
await expect(
  newPage.getByText('Level 1 Course (BEGINNER)')
).toBeVisible();
console.log('[Test] Enrollment confirmation verified.');


            // 10. Click View Course (opens new tab)
            const viewCourseBtn = newPage.getByRole('button', { name: 'View Course' });
            const [courseTab] = await Promise.all([
                newPage.waitForEvent('popup'),
                viewCourseBtn.click(),
            ]);
            await courseTab.waitForLoadState();

            // 11. Verify course page content
            await expect(
  courseTab.locator('h1', { hasText: 'Level 1 Self-Paced' })
).toBeVisible();

// Card title (h2) in the purchased card
await expect(
  courseTab.locator('h2', { hasText: 'Level 1 Self-Paced' })
).toBeVisible();

// Buttons
await expect(
  courseTab.getByRole('button', { name: 'Onboarding Guide' })
).toBeVisible();

await expect(
  courseTab.getByRole('button', { name: /Connect Discord/i })
).toBeVisible();

await expect(
  courseTab.getByRole('button', { name: /Codeforces/i })
).toBeVisible();

// Validity & CTA
await expect(courseTab.getByText('Purchased on:')).toBeVisible();
await expect(courseTab.getByText('Doubt Support ends on:')).toBeVisible();
await expect(courseTab.getByText('Lecture Access ends on:')).toBeVisible();

await expect(courseTab.getByRole('button', { name: 'Start Learning Now' })).toBeVisible();
console.log('[Test] Checkout E2E flow completed.');

            
        });
    });
});

