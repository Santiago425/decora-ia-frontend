import type { EditTool, Redesign } from '../types/redesign';

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isEditReady(tool: EditTool | undefined, values: Record<string, string>) {
  if (!tool) return false;
  return tool.fields.every((field) => {
    const value = (values[field.key] ?? '').trim();
    if (field.kind === 'color') return HEX.test(value);
    if (field.kind === 'material') return field.options.some((option) => option.slug === value);
    return value.length > 0;
  });
}

export function initialValues(tool: EditTool | undefined, suggestedColor?: string) {
  const values: Record<string, string> = {};
  tool?.fields.forEach((field) => {
    if (field.kind === 'color') values[field.key] = suggestedColor ?? '#d9cbb3';
    if (field.kind === 'material') values[field.key] = field.options[0]?.slug ?? '';
  });
  return values;
}

export function versionDetail(version: Redesign) {
  if (version.status === 'error') return 'Falló';
  if (version.inspiration_image_url) return version.inspiration_name || 'Inspiración';
  return version.edit_tool?.name ?? version.style?.name ?? '';
}
