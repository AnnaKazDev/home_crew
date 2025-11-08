import type { Page, Locator } from '@playwright/test';

export class DateNavigator {
  readonly page: Page;

  // Date navigator elements
  readonly pickDateButton: Locator;
  readonly pickDateButtonMobile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pickDateButton = page.getByTestId('date-navigator-pick-date');
    this.pickDateButtonMobile = page.getByTestId('date-navigator-pick-date-mobile');
  }

  async selectDate(date: Date): Promise<void> {
    // Click the pick date button (works for both desktop and mobile)
    const pickDateButton = await this.pickDateButton.or(this.pickDateButtonMobile).first();
    await pickDateButton.click();

    // Wait for calendar to appear
    await this.page.waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible' });

    // Format date for calendar selection
    const dateString = date.toISOString().split('T')[0];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate().toString();

    // Click on the specific day in calendar
    await this.page.getByRole('button', { name: day }).click();
  }

  async getCurrentDate(): Promise<string> {
    // Try to get current date from the displayed text
    const dateElement = this.page.locator('.font-semibold').first();
    return (await dateElement.textContent()) || '';
  }
}
