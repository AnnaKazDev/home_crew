import type { Page, Locator } from '@playwright/test';
import { DateNavigator } from './DateNavigator';
import { ChoreCard } from './ChoreCard';

export class DailyChoresPage {
  readonly page: Page;

  // Main page elements
  readonly container: Locator;
  readonly addChoreButton: Locator;

  // Columns
  readonly todoColumn: Locator;
  readonly doneColumn: Locator;

  // Components
  readonly dateNavigator: DateNavigator;

  constructor(page: Page) {
    this.page = page;
    // Try different selectors since data-test-id might not work
    this.container = page.locator('.min-h-screen.bg-background.pt-8');
    this.addChoreButton = page.locator('[data-test-id="add-chore-button"]');
    this.todoColumn = page.locator('[data-test-id="chore-column-todo"]');
    this.doneColumn = page.locator('[data-test-id="chore-column-done"]');
    this.dateNavigator = new DateNavigator(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/daily_chores');
  }

  async clickAddChore(): Promise<void> {
    await this.addChoreButton.click();
  }

  async getTodoChores(): Promise<Locator[]> {
    return this.todoColumn.locator('[data-test-id^="chore-card-"]').all();
  }

  async getDoneChores(): Promise<Locator[]> {
    return this.doneColumn.locator('[data-test-id^="chore-card-"]').all();
  }

  async waitForLoad(): Promise<void> {
    // The most reliable selector - wait for the data-test-id
    try {
      await this.page
        .locator('[data-test-id="daily-view"]')
        .waitFor({ state: 'visible', timeout: 15000 });
      return;
    } catch (error) {
      // Continue to fallback selectors
    }

    // Fallback selectors if the data-test-id doesn't work
    const selectors = [
      '.min-h-screen.bg-background', // Original selector without pt-8
      '.min-h-screen', // Fallback - just min-h-screen
      'h1:has-text("Daily Chores")', // Look for the header text
    ];

    for (const selector of selectors) {
      try {
        await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 5000 });
        return;
      } catch (error) {
        // Try next selector
      }
    }

    throw new Error(
      'Daily view did not load within timeout - authentication or component rendering issue'
    );
  }

  async clearAllChores(): Promise<void> {
    // Get all chores in both columns
    const todoChores = await this.getTodoChores();
    const doneChores = await this.getDoneChores();
    const allChores = [...todoChores, ...doneChores];

    // Delete each chore
    for (const choreLocator of allChores) {
      const choreCard = new ChoreCard(this.page, choreLocator);
      await choreCard.waitForCard();

      // Find and click delete button
      const deleteButton = choreLocator.locator('[data-test-id="chore-card-delete"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Wait for delete modal and confirm
        const deleteModal = this.page.locator('[role="dialog"]').filter({ hasText: 'Delete Task' });
        await deleteModal.waitFor({ state: 'visible' });

        const confirmButton = deleteModal.locator('button').filter({ hasText: 'Delete' });
        await confirmButton.click();

        // Wait for modal to close
        await deleteModal.waitFor({ state: 'hidden' });
      }
    }
  }

  async deleteChoreById(choreId: string): Promise<void> {
    // Find the chore card by ID
    const choreCard = this.page.locator(`[data-test-id="chore-card-${choreId}"]`);

    // Wait for the card to be visible
    await choreCard.waitFor({ state: 'visible' });

    // Find and click delete button
    const deleteButton = choreCard.locator('[data-test-id="chore-card-delete"]');
    await deleteButton.click();

    // Wait for delete modal and confirm
    const deleteModal = this.page.locator('[role="dialog"]').filter({ hasText: 'Delete Task' });
    await deleteModal.waitFor({ state: 'visible' });

    const confirmButton = deleteModal.locator('button').filter({ hasText: 'Delete' });
    await confirmButton.click();

    // Wait for modal to close
    await deleteModal.waitFor({ state: 'hidden' });

    // Wait for the chore card to disappear
    await choreCard.waitFor({ state: 'hidden' });
  }
}
