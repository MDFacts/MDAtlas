import { expect, test } from '@playwright/test'

test('tap RLQ → interview → emergency triage → doctor report', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toBeVisible()

  await page.waitForFunction(() => window.__mdatlas !== undefined)
  await page.evaluate(() => window.__mdatlas?.selectRegion('rightLowerAbdomen'))

  const painPanel = page.getByTestId('pain-input')
  await expect(painPanel).toBeVisible()
  await expect(painPanel).toContainText('Right lower abdomen')

  await painPanel.getByRole('button', { name: 'sharp' }).click()
  await page.getByTestId('severity-slider').fill('8')
  await painPanel.getByRole('button', { name: 'Today', exact: true }).click()
  await page.getByTestId('pain-submit').click()

  const answers = ['yes', 'yes', 'yes', 'yes', 'no', 'no-relation', 'no', 'no']
  for (const value of answers) {
    await page.getByTestId(`answer-${value}`).click()
  }

  await expect(page.getByTestId('tier-banner')).toHaveText('Seek emergency care now')
  await expect(page.getByTestId('red-flags')).toContainText('possible appendicitis')
  await expect(page.getByTestId('results')).toContainText('Appendicitis')

  await page.getByTestId('open-report').click()
  const report = page.getByTestId('doctor-report')
  await expect(report).toContainText('MDAtlas Symptom Report')
  await expect(report).toContainText('severity 8/10')
  await expect(report).toContainText('not a diagnosis')
})

declare global {
  interface Window {
    __mdatlas?: { selectRegion: (regionId: string) => void }
  }
}
