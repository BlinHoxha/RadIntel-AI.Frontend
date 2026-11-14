import { expect, type Page } from '@playwright/test';

// Test-only helpers for M07C: read the pinned OHIF 3.11.1 viewport state and drive the mouse in
// image coordinates. They inspect, but never change, the product's child adapter.
const IFRAME = 'iframe[title="Synthetic OHIF viewer"]';

async function child(page: Page) {
  return (await (await page.locator(IFRAME).elementHandle())!.contentFrame())!;
}

export interface ViewState {
  lower: number;
  upper: number;
  scale: number;
  focal: number[];
  tool: string;
  image: string;
}

// Reads the main viewport state; retries while the viewport briefly has no display range
// (during a reset or slice change).
export async function viewState(page: Page): Promise<ViewState> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const state = await readViewState(page);
    if (state) return state;
    await page.waitForTimeout(250);
  }
  throw new Error('Viewer has no display range.');
}

async function readViewState(page: Page): Promise<ViewState | null> {
  return (await child(page)).evaluate(() => {
    const w = window as unknown as {
      cornerstone: {
        getRenderingEngines: () => { getViewports: () => Record<string, () => unknown>[] }[];
      };
      cornerstoneTools: {
        ToolGroupManager: {
          getToolGroup: (id: string) => { getActivePrimaryMouseButtonTool: () => string };
        };
      };
    };
    const viewport = w.cornerstone
      .getRenderingEngines()
      .flatMap((engine) => engine.getViewports())
      .find((v) => (v.getImageIds?.() as string[] | undefined)?.length)!;
    const camera = viewport.getCamera() as { parallelScale: number; focalPoint: number[] };
    const voi = (viewport.getProperties() as { voiRange?: { lower: number; upper: number } })
      .voiRange;
    if (!voi || !Number.isFinite(voi.lower) || !Number.isFinite(voi.upper)) return null;
    return {
      lower: Math.round(voi.lower * 100) / 100,
      upper: Math.round(voi.upper * 100) / 100,
      scale: Math.round(camera.parallelScale * 1000) / 1000,
      focal: camera.focalPoint.map((n) => Math.round(n * 1000) / 1000),
      tool: w.cornerstoneTools.ToolGroupManager.getToolGroup(
        'default',
      ).getActivePrimaryMouseButtonTool(),
      image: String(viewport.getCurrentImageId()),
    };
  });
}

// Waits until the image and view stay unchanged for 2 s: navigation re-applies for up to 1.5 s
// after loading, and switching slices does not change the camera values.
export async function settledViewState(page: Page): Promise<ViewState> {
  let previous = JSON.stringify(await viewState(page));
  let stable = 0;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    const now = await viewState(page);
    stable = JSON.stringify(now) === previous ? stable + 1 : 0;
    previous = JSON.stringify(now);
    if (stable >= 4) return now;
  }
  throw new Error('Viewer state did not settle.');
}

// Converts image pixel coordinates of the displayed image to page coordinates.
async function toPage(page: Page, points: [number, number][]) {
  const client = await (
    await child(page)
  ).evaluate((input) => {
    const w = window as unknown as {
      cornerstone: {
        getRenderingEngines: () => { getViewports: () => Record<string, unknown>[] }[];
      };
    };
    const viewport = w.cornerstone
      .getRenderingEngines()
      .flatMap((engine) => engine.getViewports())
      .find((v) => ((v.getImageIds as () => string[] | undefined)?.() ?? []).length)!;
    // Index-to-world of the rendered image data, the mapping the display itself uses.
    const { imageData } = (
      viewport.getImageData as () => {
        imageData: { indexToWorld: (ijk: number[]) => number[] };
      }
    )();
    const box = (viewport.element as HTMLElement).getBoundingClientRect();
    return input.map((ij) => {
      const world = imageData.indexToWorld([ij[0], ij[1], 0]);
      const canvas = (viewport.worldToCanvas as (p: number[]) => number[])(world);
      return [box.left + canvas[0], box.top + canvas[1]];
    });
  }, points);
  const frame = (await page.locator(IFRAME).boundingBox())!;
  const height = page.viewportSize()!.height;
  return client.map(([x, y]) => {
    if (frame.y + y > height) throw new Error('Viewer is below the visible area.');
    return [frame.x + x, frame.y + y] as [number, number];
  });
}

async function drag(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps: 12 });
  await page.mouse.up();
}

export async function dragImage(page: Page, from: [number, number], to: [number, number]) {
  const [a, b] = await toPage(page, [from, to]);
  await drag(page, a, b);
}

// Drags from the image centre by a screen offset (for window/level, zoom and pan).
export async function dragFromCentre(page: Page, dx: number, dy: number) {
  const [centre] = await toPage(page, [[32, 32]]);
  await drag(page, centre, [centre[0] + dx, centre[1] + dy]);
}

export async function expectLength(page: Page, mm: number, sop: string) {
  const text = page.getByTestId('viewer-measurement');
  // The readout follows the drag; wait until it settles within the ±0.5 mm tolerance.
  await expect
    .poll(async () => {
      const match = /^Length: (\d+\.\d) mm on image (.+)$/.exec((await text.textContent()) ?? '');
      return match && match[2] === sop ? Number(match[1]) : NaN;
    })
    .toBeCloseTo(mm, 0);
}

export async function expectOnlyApprovedChrome(page: Page) {
  const frame = page.frameLocator(IFRAME);
  for (const selector of [
    '[data-cy="return-to-work-list"]',
    '[data-cy="Capture-btn"]',
    '[data-cy="layout-button"]',
    '[data-cy="Crosshairs-btn"]',
    '[data-cy="MeasurementTools-split-button-primary"]',
    '#viewerLayoutResizableLeftPanel',
    '#viewerLayoutResizableRightPanel',
  ])
    await expect(frame.locator(selector).first()).toBeHidden();
  await expect(page.getByRole('group', { name: 'Viewer tools' }).getByRole('button')).toHaveText([
    'Window/level',
    'Zoom',
    'Pan',
    'Length',
    'Reset view',
  ]);
}
