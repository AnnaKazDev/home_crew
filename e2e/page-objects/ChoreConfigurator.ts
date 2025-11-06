import type { Page, Locator } from '@playwright/test';

export class ChoreConfigurator {
  readonly page: Page;

  // Configurator container
  readonly container: Locator;

  // Date picker
  readonly datePickerButton: Locator;

  // Assignee options
  readonly unassignedOption: Locator;
  readonly assigneeOptions: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find within the "Configure Chore" dialog
    const dialog = page.getByRole('dialog', { name: 'Configure Chore' });
    this.container = dialog.locator('[data-test-id="chore-configurator"]');
    this.datePickerButton = dialog.getByText('Pick a date');
    this.unassignedOption = dialog.getByText('Unassigned');
    this.assigneeOptions = dialog.locator('[data-test-id^="assignee-option-"]');
    this.submitButton = dialog.getByText('Add Chore');
  }

  async waitForConfigurator(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
    // Wait for assignee options to be available
    await this.assigneeOptions.first().waitFor({ state: 'visible' });
  }

  async getCurrentDate(): Promise<string> {
    // Find the date display text (e.g., "Thursday, November 6, 2025")
    const dateDisplay = this.container.locator('text=/[A-Za-z]+, [A-Za-z]+ \\d+, \\d+/');
    const dateText = await dateDisplay.textContent();
    return dateText || '';
  }

  async verifyCurrentDate(expectedDate: string): Promise<void> {
    const currentDate = await this.getCurrentDate();
    if (!currentDate.includes(expectedDate)) {
      throw new Error(`Expected date ${expectedDate}, but got ${currentDate}`);
    }
  }

  async selectDate(date: Date): Promise<void> {
    await this.datePickerButton.click();

    // Wait for calendar to appear
    await this.page.waitForSelector('[data-radix-popper-content-wrapper]', { state: 'visible' });

    // Format date for calendar selection
    const dateString = date.toISOString().split('T')[0];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate().toString();

    // Click on the specific day in calendar
    await this.page.getByRole('button', { name: day }).click();
  }

  async getAssigneeOptions(): Promise<Locator[]> {
    return this.assigneeOptions.all();
  }

  async assignToUser(userId: string): Promise<void> {
    const userOption = this.container.locator(`[data-test-id="assignee-option-${userId}"]`);
    await userOption.check();
  }

  async assignToUnassigned(): Promise<void> {
    await this.unassignedOption.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async submitChore(assigneeId?: string): Promise<void> {
    if (assigneeId) {
      await this.assignToUser(assigneeId);
    } else {
      await this.assignToUnassigned();
    }
    await this.submit();
  }

  async isVisible(): Promise<boolean> {
    return this.container.isVisible();
  }
}
