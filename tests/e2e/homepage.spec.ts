import { expect, test } from '@playwright/test';

test.describe('moss.sg homepage', () => {
  test('EN home loads and key elements are present', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.goto('/');

    await expect(page).toHaveTitle(/moss\.sg/);
    await expect(page.locator('#hero-title')).toContainText('moss');
    await expect(page.locator('#manifesto-heading')).toBeVisible();
    await expect(page.locator('#subsystems-heading')).toBeVisible();
    await expect(page.locator('#directives-heading')).toBeVisible();
    await expect(page.getByRole('link', { name: /magi/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /sbti/ })).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
  });

  test('language toggle round-trips EN <-> ZH', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /switch language to 中/i }).click();
    await expect(page).toHaveURL(/\/zh\/?$/);
    await expect(page.locator('#hero-title')).toContainText('moss');
    // ZH page shows EN toggle
    await page.getByRole('link', { name: /switch language to EN/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('clicking the period opens the easter modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hero-title .title-dot').click();
    await expect(page.locator('#moss-easter')).toBeVisible();
  });

  test('404 page shows the galaxy error', async ({ page }) => {
    const res = await page.goto('/this-does-not-exist');
    // Astro static 404: preview server returns 404 status
    expect([404, 200]).toContain(res?.status() ?? 0);
    await expect(page.locator('body')).toContainText('Path not in this galaxy');
  });
});
