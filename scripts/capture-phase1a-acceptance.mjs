import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.PHASE1A_ACCEPTANCE_URL ?? 'http://127.0.0.1:4174';
const outputDir = process.env.PHASE1A_ACCEPTANCE_OUTPUT ?? 'phase1a-acceptance-evidence';

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  colorScheme: 'light',
});
const page = await context.newPage();

async function capture(name, path, options = {}) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: `${outputDir}/${name}.png`,
    fullPage: true,
    animations: 'disabled',
    ...options,
  });
}

await capture('01-secretary-command-center', '/?role=secretary&tab=command');
await capture('02-secretary-inquiry-review', '/?role=secretary&tab=inquiry');
await capture('03-lawyer-conflict-review', '/?role=lawyer&tab=inquiry');
await page.click('#reviewWarnings');
await page.click('#recordDecision');
await page.screenshot({
  path: `${outputDir}/04-lawyer-cleared-scheduling-gate.png`,
  fullPage: true,
  animations: 'disabled',
});
await capture('05-technical-admin-denial', '/?role=admin&tab=inquiry');
await capture('06-printable-packet-screen', '/?role=lawyer&tab=packet');

await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: `${outputDir}/phase1a-intake-conflict-consultation-packet.pdf`,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
