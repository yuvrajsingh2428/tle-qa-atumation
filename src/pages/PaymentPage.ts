import { Page, FrameLocator, Locator, expect } from '@playwright/test';

export class PaymentPage {
    readonly page: Page;
    readonly frame: FrameLocator;
    readonly closeButton: Locator;
    readonly netbankingOption: Locator;
    readonly cardOption: Locator;
    readonly upiOption: Locator;
    readonly emiOption: Locator;
    readonly merchantName: Locator;

    constructor(page: Page) {
        this.page = page;
        // Standard Razorpay iframe class or src
        this.frame = page.frameLocator('iframe[class="razorpay-checkout-frame"], iframe[src*="razorpay.com"]');

        // Locators based on provided HTML
        this.upiOption = this.frame.getByTestId('UPI');
        this.cardOption = this.frame.getByTestId('Cards');
        this.emiOption = this.frame.getByTestId('EMI');
        this.netbankingOption = this.frame.getByTestId('Netbanking');

        this.merchantName = this.frame.getByTestId('merchantName');
        this.closeButton = this.frame.getByTestId('checkout-close');
        this.frame = page.frameLocator('iframe[class="razorpay-checkout-frame"], iframe[src*="razorpay.com"]');

    }

    private getBankFrame() {
    
    return this.frame.frameLocator('iframe[src*="mocksharp"], iframe[src*="bank"]');
    }


    async verifyModalLoaded() {
        // Wait for the iframe to be visible
        await expect(this.page.locator('iframe[class="razorpay-checkout-frame"]')).toBeVisible({ timeout: 10000 });

        // Allow some time for the iframe content to stabilize/render
        await this.page.waitForTimeout(2000);

        const contactHeader = this.frame.getByText('Contact details Enter mobile');
        const paymentOptions = this.upiOption.or(this.cardOption).or(this.netbankingOption);

        // Wait for either the contact screen or payment options to load
        await expect(contactHeader.or(paymentOptions).first()).toBeVisible({ timeout: 10000 });

        // If contact screen is visible, handle it step-by-step
        if (await contactHeader.isVisible()) {
            await this.frame.getByTestId('contactNumber').fill('8400817642');

            // Wait slightly after filling input
            await this.page.waitForTimeout(500);

            // Click Continue/Proceed if visible
            const continueBtn = this.frame.locator('button').filter({ hasText: /Proceed|Continue/ });
            if (await continueBtn.isVisible()) {
                await continueBtn.click();
                // Wait for transition after clicking continue
                await this.page.waitForTimeout(2000);
            }
        }

        // Verify at least one payment option is visible to ensure content loaded
        await expect(this.netbankingOption.or(this.cardOption).or(this.upiOption).first()).toBeVisible({ timeout: 15000 });
    }

    async close() {
        // Wait for any animations to settle
        await this.page.waitForTimeout(2000);

        // Try clicking close button, if not found/visible, press Escape
        if (await this.closeButton.isVisible()) {
            await this.closeButton.click();
        } else {
            await this.page.keyboard.press('Escape');
        }

        // Check for "Are you sure you want to exit?" confirmation modal
        const exitConfirmation = this.frame.getByText('Are you sure you want to exit?');
        const yesExitBtn = this.frame.getByTestId('confirm-positive');

        try {
            if (await exitConfirmation.isVisible({ timeout: 3000 })) {
                if (await yesExitBtn.isVisible()) {
                    await yesExitBtn.click();
                }
            }
        } catch (e) {
            // Ignore timeout if confirmation doesn't appear
        }

        // Verify modal is closed
        await expect(this.page.locator('iframe[class="razorpay-checkout-frame"]')).toBeHidden({ timeout: 20000 });
    }

    // async payWithCard(details: { number: string, expiry: string, cvv: string, name: string }) {
    //     await this.cardOption.click();

    //     // Fill details
    //     await this.frame.locator('input[name="card.number"]').fill(details.number);
    //     await this.frame.locator('input[name="card.expiry"]').fill(details.expiry);
    //     await this.frame.locator('input[name="card.cvv"]').fill(details.cvv);
    //     await this.frame.locator('input[name="card.name"]').fill(details.name);

    //     // Click Continue
    //     console.log("Clicking Continue...");
    //     await this.frame.locator('button').filter({ hasText: 'Continue' }).click();

    //     // 1. Handle "Save Card" Popup
    //     const maybeLaterBtn = this.frame.locator('button[name="pay_without_saving_card"]');
    //     try {
    //         console.log("Checking for 'Maybe later' button...");
    //         // Wait up to 5s to see if it appears
    //         await maybeLaterBtn.waitFor({ state: 'visible', timeout: 5000 });
    //         await maybeLaterBtn.click();
    //         console.log("Clicked 'Maybe later'. Waiting for it to disappear...");
    //         await maybeLaterBtn.waitFor({ state: 'hidden', timeout: 5000 });
    //     } catch (e) {
    //         console.log("'Maybe later' button did not appear or timed out. Proceeding...");
    //     }

    //     // 2. Handle "Success" on Mock Bank Page
    //     // Assuming it's in the same iframe (redirected content)
    //     console.log("Waiting for 'Success' button...");
    //     const successBtn = this.frame.locator('button.success');

    //     // Retry logic for finding success button in case of slow redirect
    //     try {
    //         await successBtn.waitFor({ state: 'visible', timeout: 30000 });
    //         await successBtn.click();
    //         console.log("Clicked 'Success' button.");
    //     } catch (e) {
    //         console.error("Success button not found via locator button.success. Trying text fallback...");
    //         try {
    //             // Fallback by text
    //             await this.frame.getByRole('button', { name: 'Success' }).click({ timeout: 5000 });
    //             console.log("Clicked 'Success' button via text.");
    //         } catch (e2) {
    //             console.error("Failed to click Success button.");
    //             throw e2;
    //         }
    //     }

    //     // 3. Wait for Redirection (User requested 15s wait)
    //     console.log("Waiting 15s for payment success redirection...");
    //     await this.page.waitForTimeout(15000);
    // }
    

    // try upi
    
//     async payWithCard(details: { number: string; expiry: string; cvv: string; name: string }): Promise<boolean> {
//   try {
//     await this.cardOption.click();

//     // 1) Fill details
//     await this.frame.locator('input[name="card.number"]').fill(details.number);
//     await this.frame.locator('input[name="card.expiry"]').fill(details.expiry);
//     await this.frame.locator('input[name="card.cvv"]').fill(details.cvv);
//     await this.frame.locator('input[name="card.name"]').fill(details.name);

//     // 2) Click Continue AND wait for popup at the same time
//     console.log('[PaymentPage] Clicking Continue (card) and waiting for mock bank page...');
//     const [bankPage] = await Promise.all([
//       this.page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
//       this.frame.getByRole('button', { name: /Continue/i }).click(),
//     ]);

//     const maybeLaterBtn = this.frame.locator('button[name="pay_without_saving_card"]');
//         try {
//             console.log("Checking for 'Maybe later' button...");
//             // Wait up to 5s to see if it appears
//             await maybeLaterBtn.waitFor({ state: 'visible', timeout: 5000 });
//             await maybeLaterBtn.click();
//             console.log("Clicked 'Maybe later'. Waiting for it to disappear...");
//             await maybeLaterBtn.waitFor({ state: 'hidden', timeout: 5000 });
//         } catch (e) {
//             console.log("'Maybe later' button did not appear or timed out. Proceeding...");
//         }
//     // 3) If your flow still shows "Maybe later" INSIDE Razorpay BEFORE popup, move that logic
//     //    ABOVE the Promise.all. In your last run, the pain point was bank page, so we focus there.

//     // 4) Decide which page to use: popup or current
//     const targetPage = bankPage ?? this.page;

//     // 5) Wait for demo bank content
//     console.log('[PaymentPage] Waiting for Razorpay demo bank content...');
//     await targetPage
//       .getByText('Welcome to Razorpay Software Private Ltd Bank')
//       .waitFor({ timeout: 15000 });

//     // 6) Click Success on demo bank page
//     console.log('[PaymentPage] Clicking Success on demo bank page...');
//     await targetPage.locator('button.success').click();

//     // 7) If popup exists, wait for it to close
//     if (bankPage) {
//       console.log('[PaymentPage] Waiting for bank popup to close...');
//       await bankPage.waitForEvent('close', { timeout: 30000 });
//     }

//     // 8) Back on merchant app: wait for Razorpay checkout iframe to disappear
//     console.log('[PaymentPage] Waiting for Razorpay checkout iframe to disappear...');
//     await expect(
//       this.page.locator('iframe[class="razorpay-checkout-frame"], iframe[src*="razorpay.com"]'),
//     ).toBeHidden({ timeout: 30000 });

//     console.log('[PaymentPage] Razorpay iframe hidden after card payment.');
//     return true;
//   } catch (err: unknown) {
//     console.error('[PaymentPage] Card payment flow failed, will fallback to UPI.', err);
//     return false;
//   }
// }


//     async payWithCard(details: { number: string; expiry: string; cvv: string; name: string }): Promise<boolean> {
//   try {
//     await this.cardOption.click();

//     // Fill card details
//     await this.frame.locator('input[name="card.number"]').fill(details.number);
//     await this.frame.locator('input[name="card.expiry"]').fill(details.expiry);
//     await this.frame.locator('input[name="card.cvv"]').fill(details.cvv);
//     await this.frame.locator('input[name="card.name"]').fill(details.name);

//     // Click Continue
//     console.log('[PaymentPage] Clicking Continue (card)...');
//     await this.frame.getByRole('button', { name: /Continue/i }).click();

//     // Optional "Save card / Maybe later" popup
//     const maybeLaterBtn = this.frame.locator('button[name="pay_without_saving_card"]');
//     try {
//       console.log("[PaymentPage] Checking for 'Maybe later' button...");
//       await maybeLaterBtn.waitFor({ state: 'visible', timeout: 5000 });
//       await maybeLaterBtn.click();
//       console.log("[PaymentPage] Clicked 'Maybe later'.");
//     } catch {
//       console.log("[PaymentPage] 'Maybe later' not shown.");
//     }

//     // Now Razorpay loads the mock bank page INSIDE THE SAME FRAME
//     console.log('[PaymentPage] Waiting for Razorpay demo bank content inside checkout iframe...');
//     await this.frame
//       .getByText('Welcome to Razorpay Software Private Ltd Bank')
//       .waitFor({ timeout: 30000 });
//     console.log('[PaymentPage] Demo bank content loaded inside iframe.');

//     // Click Success in the same frame
//     console.log('[PaymentPage] Clicking Success button in demo bank page...');
//     await this.frame.locator('button.success').click();

//     // After clicking Success, Razorpay processes callback and should close the checkout frame
//     console.log('[PaymentPage] Waiting for Razorpay checkout iframe to disappear...');
//     await expect(
//       this.page.locator('iframe[class="razorpay-checkout-frame"], iframe[src*="razorpay.com"]'),
//     ).toBeHidden({ timeout: 30000 });
//     console.log('[PaymentPage] Razorpay iframe hidden after card payment.');

//     return true;
//   } catch (err: unknown) {
//     console.error('[PaymentPage] Card payment flow failed, will fallback to UPI.', err);
//     return false;
//   }
// }




    async payWithUpi(upiId: string): Promise<void> {
  console.log('[PaymentPage] Starting UPI payment...');

  // Wait for any overlay/backdrop to vanish before clicking UPI
  const overlay = this.frame.locator('#overlay-backdrop, [data-testid^="overlay-"]');
  try {
    await overlay.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('[PaymentPage] Overlay/backdrop is hidden.');
  } catch {
    console.log('[PaymentPage] Overlay/backdrop not found or did not hide in time, proceeding anyway.');
  }

  await this.upiOption.click();

  await this.frame.getByText('Pay with UPI ID / Number').waitFor({ timeout: 10000 });

  const vpaInput = this.frame.locator('input[name="vpa"]');
  await vpaInput.fill(upiId);

  const verifyAndPayBtn =
    this.frame.getByTestId('vpa-submit').or(
      this.frame.getByRole('button', { name: /Verify and Pay/i }),
    );
  await verifyAndPayBtn.click();
  console.log('[PaymentPage] Clicked Verify and Pay (UPI).');

  await expect(this.page.locator('iframe[class="razorpay-checkout-frame"], iframe[src*="razorpay.com"]'))
    .toBeHidden({ timeout: 30000 });

  console.log('[PaymentPage] Razorpay iframe hidden after UPI payment.');
}



}

  
