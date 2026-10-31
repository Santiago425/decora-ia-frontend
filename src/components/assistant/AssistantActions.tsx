import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assistantBus } from '../../assistant/assistantBus';
import { PAGE_PATHS } from '../../assistant/pageContext';

export function AssistantActions() {
  const navigate = useNavigate();

  useEffect(
    () =>
      assistantBus.subscribe((action) => {
        const { params } = action;
        switch (action.type) {
          case 'navigate':
            navigate(PAGE_PATHS[String(params.to)] ?? '/');
            return true;
          case 'open_project':
            navigate(`/editor/${params.project_id}`);
            return true;
          case 'start_redesign': {
            const query = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]));
            navigate(`/redesign?${query}`);
            return true;
          }
          default:
            return false;
        }
      }),
    [navigate],
  );

  return null;
}
