import RenderLoginContent from '../pages/login';
import RenderRegistrationContent from '../pages/registration';
import RenderMainContent from '../pages/main';

const routes: Record<string, () => string> = {
  '/login': RenderLoginContent,
  '/registration': RenderRegistrationContent,
  '/main': RenderMainContent,
};

export function navigate(path: string): void {
  history.pushState({}, '', path);
  renderRoute();
}

export function renderRoute(): void {
  const path = window.location.pathname;

  const page = routes[path];

  if (!page) {
    navigate('/login');
    return;
  }

  const root = document.querySelector('#app');

  if (!root) {
    return;
  }

  root.innerHTML = page();
}

window.addEventListener('popstate', renderRoute);
