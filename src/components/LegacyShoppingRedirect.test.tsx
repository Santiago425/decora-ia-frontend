// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LegacyShoppingRedirect } from './LegacyShoppingRedirect';

describe('LegacyShoppingRedirect', () => {
  it('sends the old shopping list address to the new one', () => {
    render(
      <MemoryRouter initialEntries={['/projects/p1/compras']}>
        <Routes>
          <Route path="/projects/:projectId/compras" element={<LegacyShoppingRedirect />} />
          <Route path="/projects/:projectId/shopping-list" element={<p>shopping list page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('shopping list page')).toBeTruthy();
  });
});
