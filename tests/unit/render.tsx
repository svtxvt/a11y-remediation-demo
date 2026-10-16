import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';

/** Render a settings page inside a <main> landmark, the way the app shell does. */
export function renderPage(Page: ComponentType) {
  const user = userEvent.setup();
  const result = render(
    <main>
      <Page />
    </main>,
  );
  return { user, ...result };
}
