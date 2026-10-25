import LoginPage from '../pages/login';
import RegistrationPage from '../pages/registration';
import ChatsPage from '../pages/main';
import ErrorPage from '../pages/error';
import HomePage from '../pages/home';
import ProfilePage from '../pages/profile';
import EditProfilePage from '../pages/editProfile';
import ChangePasswordPage from '../pages/changePassword';
import type { RenderContent } from '../pages/render';

type PageRenderer = (renderToHtml: RenderContent) => void | (() => void);

const routes: Record<string, PageRenderer> = {
  '/login': LoginPage,
  '/registration': RegistrationPage,
  '/main': ChatsPage,
  '/error': ErrorPage,
  '/': HomePage,
  '/profile': ProfilePage,
  '/edit-profile': EditProfilePage,
  '/change-password': ChangePasswordPage,
};

let cleanupPage: void | (() => void);

export function navigate(path: string, queryParams?: Record<string, string>): void {
  const queryString = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
  history.pushState({}, '', path + queryString);
  renderRoute();
}

export function renderRoute(): void {
  const path = window.location.pathname;

  const page = Object.hasOwn(routes, path) ? routes[path] : undefined;

  if (!page) {
    history.replaceState({}, '', '/error?code=404');
    renderRoute();
    return;
  }

  const root = document.querySelector('#app');
  if (!root) throw new Error('Application root not found');
  cleanupPage?.();
  cleanupPage = undefined;
  cleanupPage = page((content) => {
    if (typeof content === 'string') {
      root.innerHTML = content;
    } else {
      root.replaceChildren(content);
    }
  });
}

window.addEventListener('popstate', renderRoute);

document.addEventListener('click', (event) => {
  if (!(event instanceof MouseEvent) || event.defaultPrevented
    || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (!(event.target instanceof Element)) return;

  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href);
  if (url.origin !== window.location.origin || url.hash) return;

  event.preventDefault();
  history.pushState({}, '', url.pathname + url.search);
  renderRoute();
});
