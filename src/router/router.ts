import RenderLoginContent from '../pages/login';
import RenderRegistrationContent from '../pages/registration';
import RenderMainContent from '../pages/main';
import RenderErrorContent from '../pages/error';
import RenderHomePageContent from '../pages/home';
import RenderProfileContent from '../pages/profile';
import RenderEditProfileContent from '../pages/editProfile';
import RenderChangePasswordContent from '../pages/changePassword';

const routes: Record<string, () => string> = {
  '/login': RenderLoginContent,
  '/registration': RenderRegistrationContent,
  '/main': RenderMainContent,
  '/error': RenderErrorContent,
  '/': RenderHomePageContent,
  '/profile': RenderProfileContent,
  '/edit-profile': RenderEditProfileContent,
  '/change-password': RenderChangePasswordContent,
};

export function navigate(path: string, queryParams?: Record<string, string>): void {
  const queryString = queryParams ? '?' + new URLSearchParams(queryParams).toString() : '';
  history.pushState({}, '', path + queryString);
  renderRoute();
}

export function renderRoute(): void {
  const path = window.location.pathname;

  const page = routes[path];

  if (!page) {
    navigate('/error', { code: '404' });
    return;
  }

  const root = document.querySelector('#app');

  if (!root) {
    return;
  }

  root.innerHTML = page();
}

window.addEventListener('popstate', renderRoute);
