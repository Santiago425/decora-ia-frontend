import type { Redesign } from '../../types/redesign';
import { versionDetail } from '../../utils/editTools';
import { resolveMediaUrl } from '../../utils/media';

interface Props {
  versions: Redesign[];
  current: string;
  onSelect: (version: Redesign) => void;
}

export function RedesignVersions({ versions, current, onSelect }: Props) {
  if (versions.length < 2) return null;
  const total = versions.length;

  return (
    <div className="redesign-versions" role="group" aria-label="Versiones del rediseño">
      {versions.map((version, index) => {
        const thumb = resolveMediaUrl(version.result_image_url ?? version.original_image_url);
        const label = `Versión ${total - index}`;
        return (
          <button
            key={version.id}
            type="button"
            className={`version-thumb ${version.id === current ? 'selected' : ''}`}
            aria-pressed={version.id === current}
            aria-label={`${label}: ${versionDetail(version)}`}
            onClick={() => onSelect(version)}
          >
            {thumb && <img src={thumb} alt="" loading="lazy" />}
            <span>
              <strong>{label}</strong>
              {versionDetail(version)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
