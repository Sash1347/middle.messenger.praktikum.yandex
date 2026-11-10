import LoginPage from '../pages/login';
import RegistrationPage from '../pages/registration';
import MessengerPage from '../pages/main';
import ErrorPage from '../pages/error';
import ProfilePage from '../pages/profile';
import EditProfilePage from '../pages/editProfile';
import ChangePasswordPage from '../pages/changePassword';
import type { RenderContent } from '../pages/render';
import { authService } from '../utils/auth';

const ROOT_QUERY = '#app';

interface RouteDefinition {
  pathname: string;
  pageRenderer: (renderToHtml: RenderContent) => void;
  requireAuth: boolean;
}

const routes: RouteDefinition[] = [
  { pathname: '/', pageRenderer: LoginPage, requireAuth: false },
  { pathname: '/sign-up', pageRenderer: RegistrationPage, requireAuth: false },
  { pathname: '/messenger', pageRenderer: MessengerPage, requireAuth: true },
  { pathname: '/settings', pageRenderer: ProfilePage, requireAuth: true },
  { pathname: '/edit-profile', pageRenderer: EditProfilePage, requireAuth: true },
  { pathname: '/change-password', pageRenderer: ChangePasswordPage, requireAuth: true },
  { pathname: '/404', pageRenderer: ErrorPage, requireAuth: true },
  { pathname: '/500', pageRenderer: ErrorPage, requireAuth: true },
];

const GUEST_PATHS = new Set(['/', '/sign-up']);
let navigationId = 0;

function renderPage(pageRenderer: RouteDefinition['pageRenderer']): void {
  const root = document.querySelector(ROOT_QUERY);
  if (!root) throw new Error(`Root element ${ROOT_QUERY} not found`);

  root.innerHTML = '';
  pageRenderer((content) => {
    if (typeof content === 'string') {
      root.innerHTML = content;
    } else {
      root.replaceChildren(content);
    }
  });
}

export function navigate(path: string, queryParams?: Record<string, string>): void {
  const queryString = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
  history.pushState({}, '', path + queryString);
  renderRoute();
}

async function renderRoute(): Promise<void> {
  const currentNavigationId = ++navigationId;
  let path = window.location.pathname;
  let route = routes.find((candidate) => candidate.pathname === path);

  if (!route) {
    history.replaceState({}, '', '/404?code=404');
    path = '/404';
    route = routes.find((candidate) => candidate.pathname === path);
  }

  if (!route) return;

  let isAuthenticated = authService.isAuthenticated();
  try {
    isAuthenticated = await authService.checkSession();
  } catch {
    isAuthenticated = false;
  }

  if (currentNavigationId !== navigationId) return;

  if (!isAuthenticated && (route.requireAuth || !GUEST_PATHS.has(path))) {
    history.replaceState({}, '', '/');
    path = '/';
  } else if (isAuthenticated && GUEST_PATHS.has(path)) {
    history.replaceState({}, '', '/messenger');
    path = '/messenger';
  }

  route = routes.find((candidate) => candidate.pathname === path);
  if (route) renderPage(route.pageRenderer);
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
  void renderRoute();
});

export function initRouter(): void {
  void renderRoute();
}
