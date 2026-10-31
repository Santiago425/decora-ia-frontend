import type { ProjectStatus } from './dashboard';

export type Vec2 = [number, number];
export type Size3 = [number, number, number];

export interface RoomData {
  width: number;
  length: number;
  height: number;
  wall_material: string | null;
  floor_material: string | null;
}

export interface LightingData {
  color: string;
  intensity: number;
}

export interface SceneItemData {
  kind: 'item';
  id: string;
  furniture_id: number | null;
  name: string;
  category: string;
  shape: string;
  position: Vec2;
  rotation: number;
  size: Size3;
  color: string;
  price: number;
  finish: string | null;
  addons: string[];
}

export interface SceneGroupData {
  kind: 'group';
  id: string;
  name: string;
  children: SceneNodeData[];
}

export type SceneNodeData = SceneItemData | SceneGroupData;

export interface SceneData {
  format: number;
  style: string | null;
  room: RoomData;
  lighting: LightingData;
  nodes: SceneNodeData[];
}

export type ProjectAction = 'start' | 'finish' | 'reopen';

export interface NamedRef {
  slug: string;
  name: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  status: ProjectStatus;
  actions: ProjectAction[];
  style: NamedRef | null;
  room_type: NamedRef | null;
  estimated_budget: string;
  scene: SceneData;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VersionSummary {
  id: number;
  label: string;
  estimated_budget: string;
  items: number;
  created_at: string;
}

export interface VersionDetail extends VersionSummary {
  scene: SceneData;
}

export interface NewProject {
  name: string;
  room_type: string;
  style: string;
  furnished: boolean;
}
