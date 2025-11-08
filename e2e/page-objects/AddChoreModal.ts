import type { Page, Locator } from '@playwright/test';

export class AddChoreModal {
  readonly page: Page;

  // Modal container
  readonly modal: Locator;

  // Steps
  readonly catalogStep: Locator;
  readonly formStep: Locator;
  readonly configStep: Locator;

  // Catalog step elements
  readonly catalogSelector: Locator;
  readonly catalogItems: Locator;
  readonly createCustomButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use role-based selector for the main dialog
    this.modal = page.getByRole('dialog', { name: 'Choose a Chore' });
    this.catalogStep = page.locator('[data-test-id="add-chore-modal-catalog-step"]');
    this.formStep = page.locator('[data-test-id="add-chore-modal-form-step"]');
    this.configStep = page.locator('[data-test-id="add-chore-modal-config-step"]');
    this.catalogSelector = page.locator('[data-test-id="chore-catalog-selector"]');
    // Find all chore buttons in the catalog (they are buttons with emoji and text)
    this.catalogItems = page.locator('button:has-text("pts")');
    this.createCustomButton = page.getByText('Add Custom Chore');
  }

  async waitForModal(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' });
  }

  async waitForCatalogStep(): Promise<void> {
    await this.catalogStep.waitFor({ state: 'visible' });
  }

  async waitForConfigStep(): Promise<void> {
    await this.configStep.waitFor({ state: 'visible' });
  }

  async getCatalogItems(): Promise<Locator[]> {
    // Wait for at least one catalog item to be visible before getting all items
    await this.catalogItems.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.catalogItems.all();
  }

  async selectRandomChore(): Promise<{ title: string; points: number; element: Locator }> {
    const items = await this.getCatalogItems();

    if (items.length === 0) {
      throw new Error('No catalog items found in the modal');
    }

    const randomIndex = Math.floor(Math.random() * Math.min(items.length, 10)); // Limit to first 10 items
    const selectedItem = items[randomIndex];

    // Extract title and points from the text content
    const title = (await selectedItem.locator('h4').first().textContent()) || '';
    // Find text containing "pts" in the item
    const itemText = (await selectedItem.textContent()) || '';
    const pointsMatch = itemText.match(/(\d+)\s*pts/);
    const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;

    await selectedItem.click();

    return { title, points, element: selectedItem };
  }

  async clickCreateCustom(): Promise<void> {
    await this.createCustomButton.click();
  }

  async isModalVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }
}
