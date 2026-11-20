import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { catalogService } from '../../services/catalogService';
import { Coverflow, type CoverflowItem } from '../motion';
import { Skeleton } from '../ui';

/** Interior photos from the catalog; opening one starts a redesign with its style and room preselected. */
export function InspirationGallery() {
  const navigate = useNavigate();
  const { data, loading } = useAsync(useCallback(() => catalogService.inspiration(), []));

  if (loading && !data) return <Skeleton height={340} radius="var(--radius-photo)" />;
  if (!data?.length) return null;

  const items: CoverflowItem[] = data.map((photo) => ({
    id: photo.id,
    src: photo.image_url,
    alt: photo.title,
    title: photo.title,
    caption: [photo.style?.name, photo.room_type?.name].filter(Boolean).join(' · '),
  }));

  function open(item: CoverflowItem) {
    const photo = data?.find((entry) => entry.id === item.id);
    if (!photo) return;
    const params = new URLSearchParams();
    if (photo.style) params.set('style', photo.style.slug);
    if (photo.room_type) params.set('room_type', photo.room_type.slug);
    navigate(`/redesign?${params.toString()}`);
  }

  return <Coverflow items={items} label="Galería de inspiración" onOpen={open} />;
}
