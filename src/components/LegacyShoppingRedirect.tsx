import { Navigate, useParams } from 'react-router-dom';
import { shoppingPath } from '../shopping/shoppingList';

/** Sends links saved with the old shopping list address to the current one. */
export function LegacyShoppingRedirect() {
  const { projectId = '' } = useParams();
  return <Navigate to={shoppingPath(projectId)} replace />;
}
