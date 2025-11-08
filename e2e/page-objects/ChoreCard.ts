import type { Page, Locator } from '@playwright/test';

export class ChoreCard {
  readonly page: Page;
  readonly card: Locator;

  // Card elements
  readonly title: Locator;
  readonly points: Locator;
  readonly assignee: Locator;

  constructor(page: Page, cardLocator: Locator) {
    this.page = page;
    this.card = cardLocator;
    this.title = cardLocator.getByTestId('chore-card-title');
    this.points = cardLocator.getByTestId('chore-card-points');
    this.assignee = cardLocator.getByTestId('chore-card-assignee');
  }

  static fromChoreId(page: Page, choreId: string): ChoreCard {
    const card = page.getByTestId(`chore-card-${choreId}`);
    return new ChoreCard(page, card);
  }

  async getTitle(): Promise<string> {
    return (await this.title.textContent()) || '';
  }

  async getPoints(): Promise<number> {
    const pointsText = await this.points.textContent();
    return parseInt(pointsText?.replace(' pts', '') || '0');
  }

  async getAssignee(): Promise<string> {
    return (await this.assignee.textContent()) || '';
  }

  async isAssigned(): Promise<boolean> {
    const assigneeText = await this.getAssignee();
    return !assigneeText.includes('Unassigned') && !assigneeText.includes('?');
  }

  async waitForCard(): Promise<void> {
    await this.card.waitFor({ state: 'visible' });
  }

  async verifyChore(title: string, points: number, assigneeName?: string): Promise<void> {
    const actualTitle = await this.getTitle();
    const actualPoints = await this.getPoints();
    const actualAssignee = await this.getAssignee();

    if (!actualTitle.includes(title)) {
      throw new Error(`Expected title "${title}", but got "${actualTitle}"`);
    }

    if (actualPoints !== points) {
      throw new Error(`Expected ${points} points, but got ${actualPoints}`);
    }

    if (assigneeName && !actualAssignee.includes(assigneeName)) {
      throw new Error(`Expected assignee "${assigneeName}", but got "${actualAssignee}"`);
    }
  }

  async isVisible(): Promise<boolean> {
    return this.card.isVisible();
  }
}
