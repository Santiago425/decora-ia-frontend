import { History, LayoutGrid, Lock, RefreshCw, ShoppingBag, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { shoppingPath } from '../shopping/shoppingList';
import { CatalogPanel } from '../components/editor/CatalogPanel';
import { EditorCanvas, type CameraView, type EditorCanvasHandle } from '../components/editor/EditorCanvas';
import { EditorToolbar, type SaveState } from '../components/editor/EditorToolbar';
import { Inspector } from '../components/editor/Inspector';
import { RoomPanel } from '../components/editor/RoomPanel';
import { SheetHandle, type SheetState } from '../components/editor/SheetHandle';
import { PatternBadge } from '../components/patterns/PatternBadge';
import { ShortcutsDialog } from '../components/editor/ShortcutsDialog';
import { VersionsPanel } from '../components/editor/VersionsPanel';
import { assistantBus } from '../assistant/assistantBus';
import { config } from '../config';
import { ReplaceSceneCommand } from '../editor/commands';
import { RoomComposite } from '../editor/composite';
import { EditorStore, useEditorState } from '../editor/editorStore';
import { EditorMediator, type EditorPanel } from '../editor/editorMediator';
import { buildPricing } from '../editor/furnitureDecorators';
import { overlappingIds } from '../editor/layoutGuides';
import { WALK_CORNERS } from '../editor/walkView';
import { themeFactoryFor } from '../editor/styleTheme';
import { useAsync } from '../hooks/useAsync';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { catalogService } from '../services/catalogService';
import { notificationCenter } from '../services/notificationCenter';
import { projectService } from '../services/projectService';
import type { DesignStyle, FurnitureAddon, FurnitureCategory, FurnitureItem, Material } from '../types/catalog';
import type { LightingData, ProjectAction, ProjectDetail, RoomData, VersionSummary } from '../types/project';
import { Button, ButtonLink, Skeleton } from '../components/ui';

interface Catalog {
  furniture: FurnitureItem[];
  categories: FurnitureCategory[];
  materials: Material[];
  addons: FurnitureAddon[];
  styles: DesignStyle[];
}

const COMPACT_QUERY = '(max-width: 900px)';

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'color']);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['TEXTAREA', 'SELECT'].includes(target.tagName) ||
    (target instanceof HTMLInputElement && !NON_TEXT_INPUTS.has(target.type)));

function Workspace({ initial, catalog }: { initial: ProjectDetail; catalog: Catalog }) {
  const [store] = useState(
    () =>
      new EditorStore(initial.scene, {
        historyLimit: config.editor.historyLimit,
        readOnly: initial.status === 'finished',
      }),
  );
  const state = useEditorState(store);
  const [project, setProject] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [savedRevision, setSavedRevision] = useState(0);
  const [retryTick, setRetryTick] = useState(0);
  const [view, setView] = useState<CameraView>('perspective');
  const [guides, setGuides] = useState(false);
  const [corner, setCorner] = useState(0);
  const [tab, setTab] = useState<EditorPanel>('catalog');
  const [sheet, setSheet] = useState<SheetState>('peek');
  const compact = useMediaQuery(COMPACT_QUERY);
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
  const clashing = useMemo(
    () => overlappingIds(state.scene.nodes, config.editor.overlapTolerance),
    [state.scene.nodes],
  );

  useEffect(() => {
    projectService
      .versions(project.id)
      .then(setVersions)
      .catch(() => setVersions([]));
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

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mediator] = useState(
    () =>
      new EditorMediator(store, {
        catalog,
        pricing,
        moveStep: config.editor.moveStep,
        rotateStep: config.editor.rotateStep,
        showPanel: (panel) => {
          setTab(panel);
          setSheet((current) => (current === 'peek' ? 'half' : current));
        },
        notify: (message, kind) => notificationCenter.notify(message, kind),
        isCompact: () => window.matchMedia(COMPACT_QUERY).matches,
        openShortcuts: () => setShortcutsOpen(true),
        toggleGuides: () => setGuides((current) => !current),
      }),
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target)) return;
      if (mediator.handleKey(event)) event.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mediator]);

  useEffect(() => assistantBus.subscribe((action) => mediator.handleAssistant(action)), [mediator]);

  function openTab(panel: EditorPanel) {
    setTab(panel);
    if (sheet === 'peek') setSheet('half');
  }

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
        guides={guides}
        busy={busy}
        onUndo={() => store.undo()}
        onRedo={() => store.redo()}
        onView={(next) => {
          if (next === 'walk' && view === 'walk') setCorner((current) => (current + 1) % WALK_CORNERS);
          setView(next);
        }}
        onGuides={() => setGuides((current) => !current)}
        onCapture={capture}
        onRename={rename}
        onAction={runProjectAction}
        onRetrySave={() => setRetryTick((tick) => tick + 1)}
        onHelp={() => setShortcutsOpen(true)}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div className={`editor-body tab-${tab}`}>
        <section className="editor-stage" aria-label="Vista 3D de la habitación">
          <PatternBadge
            className="stage-patterns"
            ids={['command', 'mediator-editor', 'composite', 'abstract-factory', 'factory-method', 'decorator-addons']}
          />
          <EditorCanvas
            ref={canvas}
            scene={state.scene}
            pricing={pricing}
            selection={state.selection}
            readOnly={disabled}
            view={view}
            corner={corner}
            guides={guides}
            clashing={clashing}
            onSelect={(id, additive) => mediator.select(id, additive)}
            onMove={(id, dx, dz) => mediator.move(id, dx, dz)}
          />
          {disabled && (
            <div className="stage-banner">
              <Lock size={16} /> Proyecto terminado: solo lectura. Reábrelo para seguir editando.
            </div>
          )}
          {!disabled && clashing.size > 0 && (
            <div className="stage-banner stage-warning" role="status">
              <TriangleAlert size={16} /> {clashing.size} muebles se cruzan. Sepáralos para que quepan de verdad
            </div>
          )}
          <p className="stage-hint">
            {view === 'walk'
              ? 'Gira para mirar alrededor · Toca Recorrido otra vez para cambiar de esquina'
              : 'Arrastra los muebles para moverlos · Gira la vista con un dedo o el mouse'}
          </p>
        </section>

        <div className="editor-sheet" data-sheet={sheet}>
          <SheetHandle state={sheet} onChange={setSheet} />
          <aside className="editor-panel editor-left">
            <div className="panel-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'catalog' || (tab === 'settings' && !compact)}
                onClick={() => openTab('catalog')}
              >
                <LayoutGrid size={16} /> Catálogo
              </button>
              <button
                role="tab"
                className="mobile-only"
                aria-selected={tab === 'settings'}
                onClick={() => openTab('settings')}
              >
                <SlidersHorizontal size={16} /> Ajustes
              </button>
              <button role="tab" aria-selected={tab === 'versions'} onClick={() => openTab('versions')}>
                <History size={16} /> Versiones
              </button>
              <Link className="panel-tab-link" to={shoppingPath(project.id)} title="Lista de compras y presupuesto">
                <ShoppingBag size={16} /> Compras
              </Link>
            </div>
            {tab === 'versions' ? (
              <VersionsPanel
                versions={versions}
                disabled={disabled}
                busy={busy}
                onSave={saveVersion}
                onRestore={restoreVersion}
              />
            ) : (
              <div className="left-content">
                <CatalogPanel
                  categories={catalog.categories}
                  furniture={catalog.furniture}
                  roomType={project.room_type?.slug ?? null}
                  roomName={project.room_type?.name ?? null}
                  disabled={disabled}
                  onAdd={(item) => mediator.addFurniture(item)}
                />
              </div>
            )}
          </aside>

          <aside className="editor-panel editor-right">
            {selection.length ? (
              <Inspector
                selection={selection}
                categories={catalog.categories}
                furniture={catalog.furniture}
                addons={catalog.addons}
                finishes={finishes}
                palette={palette}
                disabled={disabled}
                rotateStep={config.editor.rotateStep}
                onColor={(id, color) => mediator.updateItem(id, { color, finish: null }, 'Cambiar color')}
                onFinish={(id, finish, color) => mediator.updateItem(id, { finish, color }, 'Cambiar acabado')}
                onAddons={(id, addons) => mediator.updateItem(id, { addons }, 'Cambiar complementos')}
                onRotate={(id, degrees) => mediator.rotate(id, degrees)}
                onDuplicate={(id) => mediator.duplicate(id)}
                onSnapToWall={(id) => mediator.snapToWall(id)}
                onRemove={(id) => mediator.remove(id)}
                onRename={(id, name) => mediator.rename(id, name)}
                onResize={(id, size) => mediator.resize(id, size)}
                onGroup={(ids) => mediator.group(ids, `Grupo ${composite.children.length}`)}
                onUngroup={(id) => mediator.ungroup(id)}
              />
            ) : (
              <RoomPanel
                composite={composite}
                styles={catalog.styles}
                materials={catalog.materials}
                disabled={disabled}
                onStyle={(slug) => mediator.applyStyle(slug)}
                onRoom={(room: RoomData, label: string) => mediator.setRoom(room, label)}
                onLighting={(lighting: LightingData) => mediator.setLighting(lighting)}
              />
            )}
          </aside>
        </div>
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
            <ButtonLink variant="ghost" to="/editor">
              Volver
            </ButtonLink>
            <Button variant="ghost" onClick={retry}>
              <RefreshCw size={16} /> Reintentar
            </Button>
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="editor-page editor-loading" role="status" aria-label="Cargando el editor">
        <Skeleton className="editor-skeleton" radius="var(--radius-xl)" />
      </div>
    );
  }

  const [project, furniture, categories, materials, addons, styles] = data;
  return (
    <Workspace key={project.id} initial={project} catalog={{ furniture, categories, materials, addons, styles }} />
  );
}
