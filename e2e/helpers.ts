import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page, TestInfo } from '@playwright/test';

/** Press Tab until the target has focus, like a keyboard user would. */
export async function tabUntilFocused(page: Page, target: Locator, maxPresses = 20) {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press('Tab');
    if (await isFocused(target)) return;
  }
  throw new Error(`Target was not reached with ${maxPresses} Tab presses`);
}

export function isFocused(target: Locator) {
  return target.evaluate((element) => element === document.activeElement);
}

/** Run axe on the whole page, attach the raw violations and return them. */
export async function scanWithAxe(page: Page, testInfo: TestInfo, name: string) {
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach(`${name}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  return results.violations;
}
