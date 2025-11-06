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
    this.addChoreButton = page.getByText('Add Chore').first();
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
    await this.container.waitFor({ state: 'visible' });
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
