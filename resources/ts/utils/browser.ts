// Browser utilities

export const openWindow = (
  url: string,
  title: string,
  width: number,
  height: number,
): Window | null => {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const screenWidth = screen.width || window.innerWidth || document.documentElement.clientWidth;
  const screenHeight = screen.height || window.innerHeight || document.documentElement.clientHeight;

  const systemZoom = screenWidth / screen.availWidth;
  const left = (screenWidth - width) / 2 / systemZoom + dualScreenLeft;
  const top = (screenHeight - height) / 2 / systemZoom + dualScreenTop;

  const features = [
    `scrollbars=yes`,
    `width=${width}`,
    `height=${height}`,
    `top=${top}`,
    `left=${left}`,
  ].join(',');

  const newWindow = window.open(url, title, features);
  if(newWindow) newWindow.focus();

  return newWindow;
}

