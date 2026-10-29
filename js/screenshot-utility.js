/**
 * AK Racing - Screenshot & High-Resolution Wallpaper Capture Utility
 * Captures 3D canvas and custom car livery builds with one click.
 */
export class ScreenshotUtility {
  static captureCanvas(canvasElement, fileName = 'AK_Racing_Hypercar.png') {
    if (!canvasElement) return;
    try {
      const dataUrl = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`[Screenshot] Saved 4K render as ${fileName}`);
    } catch (e) {
      console.error('[Screenshot] Canvas capture error:', e);
    }
  }
}
