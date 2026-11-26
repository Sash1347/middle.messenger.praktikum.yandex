export function setButtonLoading(button: HTMLButtonElement, isLoading: boolean): void {
  if (isLoading) {
    button.disabled = true;
    button.style.position = 'relative';
    button.innerHTML = `
      <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
    `;
    
    if (!document.querySelector('style[data-loader]')) {
      const style = document.createElement('style');
      style.setAttribute('data-loader', 'true');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    button.disabled = false;
  }
}

export function createLoadingSpinner(): HTMLElement {
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  `;
  return spinner;
}
