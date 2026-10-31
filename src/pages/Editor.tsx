import { History, LayoutGrid, Lock, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogPanel } from '../components/editor/CatalogPanel';
import { EditorCanvas, type CameraView, type EditorCanvasHandle } from '../components/editor/EditorCanvas';
import { EditorToolbar, type SaveState } from '../components/editor/EditorToolbar';
import { Inspector } from '../components/editor/Inspector';
import { RoomPanel } from '../components/editor/RoomPanel';
import { VersionsPanel } from '../components/editor/VersionsPanel';
import { config } from '../config';
import {
  AddNodesCommand,
  GroupNodesCommand,
  MoveNodeCommand,
  RemoveNodeCommand,
  RenameNodeCommand,
  ReplaceSceneCommand,
  RotateNodeCommand,
  UngroupCommand,
  UpdateItemCommand,
  UpdateSceneCommand,
} from '../editor/commands';
import { RoomComposite } from '../editor/composite';
import { EditorStore, useEditorState } from '../editor/editorStore';
import { buildPricing } from '../editor/furnitureDecorators';
import { furnitureFactoryFor } from '../editor/furnitureFactory';
import { findFreeSpot, newNodeId, topLevelIdOf } from '../editor/sceneTree';
import { themeFactoryFor } from '../editor/styleTheme';
import { useAsync } from '../hooks/useAsync';
import { catalogService } from '../services/catalogService';
import { notificationCenter } from '../services/notificationCenter';
import { projectService } from '../services/projectService';
import type { DesignStyle, FurnitureAddon, FurnitureCategory, FurnitureItem, Material } from '../types/catalog';
import type { LightingData, ProjectAction, ProjectDetail, RoomData, VersionSummary } from '../types/project';

type Tab = 'catalog' | 'settings' | 'versions';

interface Catalog {
  furniture: FurnitureItem[];
  categories: FurnitureCategory[];
  materials: Material[];
  addons: FurnitureAddon[];
  styles: DesignStyle[];
}

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'color']);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['TEXTAREA', 'SELECT'].includes(target.tagName) ||
    (target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)));

function Workspace({ initial, catalog }: { initial: ProjectDetail; catalog: Catalog }) {
  const [store] = useState(
    () => new EditorStore(initial.scene, { historyLimit: config.editor.historyLimit, readOnly: initial.status === 'finished' }),
  );
  const state = useEditorState(store);
  const [project, setProject] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [savedRevision, setSavedRevision] = useState(0);
  const [retryTick, setRetryTick] = useState(0);
  const [view, setView] = useState<CameraView>('perspective');
  const [tab, setTab] = useState<Tab>('catalog');
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<VersionSummary[] | null>(null);
  const canvas = useRef<EditorCanvasHandle>(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  const pricing = useMemo(() => buildPricing(catalog.addons, catalog.materials), [catalog]);
  const composite = useMemo(() => new RoomComposite(state.scene, pricing), [state.scene, pricing]);
  const selection = state.selection.map((id) => composite.find(id)).filter((c) => c !== undefined);
  const style = catalog.styles.find((s) => s.slug === state.scene.style);
  const palette = themeFactoryFor(style, catalog.materials).createAccentPalette();
  const finishes = catalog.materials.filter((m) => m.surface === 'furniture');
  const total = composite.price();

  useEffect(() => {
    projectService.versions(project.id).then(setVersions).catch(() => setVersions([]));
  }, [project.id]);

  useEffect(() => {
    if (state.revision === savedRevision) return;
    setSaveState('pending');
    const timer = setTimeout(async () => {
      const { revision, scene } = store.getState();
      setSaveState('saving');
      try {
        let updated = await projectService.saveScene(projectRef.current.id, scene);
        if (scene.style && scene.style !== updated.style?.slug) {
          updated = await projectService.update(updated.id, { style: scene.style });
        }
        setProject(updated);
        setSavedRevision(revision);
        setSaveState(store.getState().revision === revision ? 'saved' : 'pending');
      } catch (error) {
        setSaveState('error');
        notificationCenter.notify((error as Error).message, 'error');
      }
    }, config.editor.autosaveMs);
    return () => clearTimeout(timer);
  }, [state.revision, savedRevision, retryTick, store]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState !== 'saved') event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saveState]);

  const addFurniture = useCallback(
    (item: FurnitureItem) => {
      const scene = store.getState().scene;
      const node = furnitureFactoryFor(item.category.shape).createItem(item, findFreeSpot(scene, [item.width, item.depth]));
      if (store.execute(new AddNodesCommand([node], `Agregar ${item.name}`))) store.select([node.id]);
    },
    [store],
  );

  const duplicate = useCallback(
    (id: string) => {
      const component = new RoomComposite(store.getState().scene, pricing).find(id);
      if (!component) return;
      const copy = component.clone();
      if (store.execute(new AddNodesCommand([copy], 'Duplicar'))) store.select([copy.id]);
    },
    [store, pricing],
  );

  const remove = useCallback((id: string) => store.execute(new RemoveNodeCommand(id)), [store]);
  const rotate = useCallback((id: string, degrees: number) => store.execute(new RotateNodeCommand(id, degrees)), [store]);
  const move = useCallback((id: string, dx: number, dz: number) => store.execute(new MoveNodeCommand(id, dx, dz)), [store]);

  const select = useCallback(
    (id: string | null, additive: boolean) => {
      if (!id) return additive ? undefined : store.select([]);
      const top = topLevelIdOf(store.getState().scene.nodes, id) ?? id;
      if (additive) store.toggleSelection(top);
      else if (!store.getState().selection.includes(top) || store.getState().selection.length > 1) store.select([top]);
      if (window.matchMedia('(max-width: 900px)').matches) setTab('settings');
    },
    [store],
  );

  const applyStyle = useCallback(
    (slug: string) => {
      const theme = themeFactoryFor(catalog.styles.find((s) => s.slug === slug), catalog.materials);
      const room = store.getState().scene.room;
      store.execute(
        new UpdateSceneCommand(
          {
            style: slug,
            lighting: theme.createLighting(),
            room: { ...room, wall_material: theme.createWallFinish().slug, floor_material: theme.createFloorFinish().slug },
          },
          'Cambiar estilo',
        ),
      );
    },
    [store, catalog],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target)) return;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const [selected] = store.getState().selection;
      const step = config.editor.moveStep;
      const arrows: Record<string, [number, number]> = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] };

      if (mod && key === 'z') store[event.shiftKey ? 'redo' : 'undo']();
      else if (mod && key === 'y') store.redo();
      else if (mod && key === 'd' && selected) duplicate(selected);
      else if ((key === 'delete' || key === 'backspace') && selected) store.getState().selection.forEach(remove);
      else if (key === 'r' && !mod && selected) rotate(selected, event.shiftKey ? -config.editor.rotateStep : config.editor.rotateStep);
      else if (key in arrows && selected) move(selected, ...arrows[key]);
      else if (key === 'escape') store.select([]);
      else return;
      event.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, duplicate, remove, rotate, move]);

  async function runProjectAction(action: ProjectAction) {
    setBusy(true);
    try {
      const updated = await projectService.changeStatus(project.id, action);
      setProject(updated);
      store.setReadOnly(updated.status === 'finished');
      const messages: Record<ProjectAction, string> = {
        start: 'Proyecto en diseño',
        finish: '¡Proyecto terminado! Quedó en modo lectura',
        reopen: 'Proyecto reabierto, ya puedes editarlo',
      };
      notificationCenter.notify(messages[action], 'success');
    } catch (error) {
      notificationCenter.notify((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function rename(name: string) {
    try {
      setProject(await projectService.update(project.id, { name }));
    } catch (error) {
      notificationCenter.notify((error as Error).message, 'error');
    }
  }

  async function saveVersion(label: string) {
    setBusy(true);
    try {
      if (saveState !== 'saved') await projectService.saveScene(project.id, store.getState().scene);
      const version = await projectService.saveVersion(project.id, label);
      setVersions((current) => [version, ...(current ?? [])]);
      notificationCenter.notify(`Versión "${label}" guardada`, 'success');
    } catch (error) {
      notificationCenter.notify((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function restoreVersion(version: VersionSummary) {
    try {
      const detail = await projectService.version(project.id, version.id);
      if (store.execute(new ReplaceSceneCommand(detail.scene, `Volver a "${version.label}"`))) {
        notificationCenter.notify(`Volviste a "${version.label}". Puedes deshacerlo si cambias de idea`, 'info');
      }
    } catch (error) {
      notificationCenter.notify((error as Error).message, 'error');
    }
  }

  function capture() {
    const url = canvas.current?.capture();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}.png`;
    link.click();
  }

  const disabled = state.readOnly;

  return (
    <div className="editor-page">
      <EditorToolbar
        project={project}
        total={total}
        saveState={saveState}
        canUndo={state.canUndo && !disabled}
        canRedo={state.canRedo && !disabled}
        undoLabel={state.undoLabel}
        redoLabel={state.redoLabel}
        view={view}
        busy={busy}
        onUndo={() => store.undo()}
        onRedo={() => store.redo()}
        onView={setView}
        onCapture={capture}
        onRename={rename}
        onAction={runProjectAction}
        onRetrySave={() => setRetryTick((tick) => tick + 1)}
      />

      <div className={`editor-body tab-${tab}`}>
        <aside className="editor-panel editor-left">
          <div className="panel-tabs" role="tablist">
            <button role="tab" aria-selected={tab !== 'versions'} onClick={() => setTab('catalog')}>
              <LayoutGrid size={16} /> Catálogo
            </button>
            <button role="tab" className="mobile-only" aria-selected={tab === 'settings'} onClick={() => setTab('settings')}>
              <SlidersHorizontal size={16} /> Ajustes
            </button>
            <button role="tab" aria-selected={tab === 'versions'} onClick={() => setTab('versions')}>
              <History size={16} /> Versiones
            </button>
          </div>
          {tab === 'versions' ? (
            <VersionsPanel versions={versions} disabled={disabled} busy={busy} onSave={saveVersion} onRestore={restoreVersion} />
          ) : (
            <div className="left-content">
              <CatalogPanel
              categories={catalog.categories}
              furniture={catalog.furniture}
              roomType={project.room_type?.slug ?? null}
              roomName={project.room_type?.name ?? null}
              disabled={disabled}
              onAdd={addFurniture}
              />
            </div>
          )}
        </aside>

        <section className="editor-stage" aria-label="Vista 3D de la habitación">
          <EditorCanvas
            ref={canvas}
            scene={state.scene}
            pricing={pricing}
            selection={state.selection}
            readOnly={disabled}
            view={view}
            onSelect={select}
            onMove={move}
          />
          {disabled && (
            <div className="stage-banner">
              <Lock size={16} /> Proyecto terminado: solo lectura. Reábrelo para seguir editando.
            </div>
          )}
          <p className="stage-hint">Arrastra los muebles para moverlos · Gira la vista con un dedo o el mouse</p>
        </section>

        <aside className="editor-panel editor-right">
          {selection.length ? (
            <Inspector
              selection={selection}
              categories={catalog.categories}
              addons={catalog.addons}
              finishes={finishes}
              palette={palette}
              disabled={disabled}
              rotateStep={config.editor.rotateStep}
              onColor={(id, color) => store.execute(new UpdateItemCommand(id, { color, finish: null }, 'Cambiar color'))}
              onFinish={(id, finish, color) => store.execute(new UpdateItemCommand(id, { finish, color }, 'Cambiar acabado'))}
              onAddons={(id, addons) => store.execute(new UpdateItemCommand(id, { addons }, 'Cambiar complementos'))}
              onRotate={rotate}
              onDuplicate={duplicate}
              onRemove={remove}
              onRename={(id, name) => store.execute(new RenameNodeCommand(id, name))}
              onGroup={(ids) => {
                const id = newNodeId('g');
                if (store.execute(new GroupNodesCommand(ids, { id, name: `Grupo ${composite.children.length}` }))) store.select([id]);
              }}
              onUngroup={(id) => store.execute(new UngroupCommand(id))}
            />
          ) : (
            <RoomPanel
              composite={composite}
              styles={catalog.styles}
              materials={catalog.materials}
              disabled={disabled}
              onStyle={applyStyle}
              onRoom={(room: RoomData, label: string) => store.execute(new UpdateSceneCommand({ room }, label))}
              onLighting={(lighting: LightingData) => store.execute(new UpdateSceneCommand({ lighting }, 'Cambiar luz'))}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default function Editor() {
  const { projectId = '' } = useParams();
  const loader = useCallback(
    () =>
      Promise.all([
        projectService.get(projectId),
        catalogService.furniture(),
        catalogService.categories(),
        catalogService.materials(),
        catalogService.addons(),
        catalogService.styles(),
      ]),
    [projectId],
  );
  const { data, error, retry } = useAsync(loader);

  if (error) {
    return (
      <div className="page">
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <span className="inline-actions">
            <Link to="/editor" className="button button-ghost">
              Volver
            </Link>
            <button className="button button-ghost" onClick={retry}>
              <RefreshCw size={16} /> Reintentar
            </button>
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="editor-page editor-loading" role="status" aria-label="Cargando el editor">
        <div className="editor-skeleton" />
      </div>
    );
  }

  const [project, furniture, categories, materials, addons, styles] = data;
  return <Workspace key={project.id} initial={project} catalog={{ furniture, categories, materials, addons, styles }} />;
}
