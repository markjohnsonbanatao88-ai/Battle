import { expect, test } from '@playwright/test';

test('public site exposes intake paths and the non-engagement notice', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Legal work built on disciplined preparation');
  await expect(
    page.locator('main').getByRole('link', { name: 'Send an Inquiry', exact: true }),
  ).toHaveAttribute('href', '/inquiry');
  await expect(page.getByText('An inquiry is not yet an engagement.')).toBeVisible();
});
