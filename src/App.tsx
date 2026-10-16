import { SettingsPage as BeforePage } from './before/SettingsPage';
import { SettingsPage as AfterPage } from './after/SettingsPage';

type Route = 'home' | 'before' | 'after';

function getRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/before') return 'before';
  if (path === '/after') return 'after';
  return 'home';
}

const NOTES: Record<Route, string> = {
  home: 'Pick a version to compare.',
  before: 'You are viewing BEFORE: this version has deliberate accessibility bugs.',
  after: 'You are viewing AFTER: the same dialog with the fixes applied.',
};

export function App() {
  const route = getRoute(window.location.pathname);

  return (
    <>
      <header className="demo-bar">
        <a className="demo-home" href="/">
          Invite dialog remediation demo
        </a>
        <nav aria-label="Demo version">
          <a href="/before" aria-current={route === 'before' ? 'page' : undefined}>
            Before (broken)
          </a>
          <a href="/after" aria-current={route === 'after' ? 'page' : undefined}>
            After (fixed)
          </a>
        </nav>
        <p className="demo-note">{NOTES[route]}</p>
      </header>
      <main className="demo-main">
        {route === 'before' && <BeforePage />}
        {route === 'after' && <AfterPage />}
        {route === 'home' && <Home />}
      </main>
    </>
  );
}

function Home() {
  return (
    <div className="demo-home-page">
      <h1>Invite a teammate: before and after</h1>
      <p>
        The same small settings page is built twice. The <a href="/before">before</a> version
        contains common accessibility bugs in a modal dialog, a form and a custom switch. The{' '}
        <a href="/after">after</a> version fixes them.
      </p>
      <p>Try both with the keyboard only, then with a screen reader.</p>
    </div>
  );
}
