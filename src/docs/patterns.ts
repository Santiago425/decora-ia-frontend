export type PatternCategory = 'Creacional' | 'Estructural' | 'Comportamiento' | 'Arquitectura';
export type Side = 'Backend' | 'Frontend';

export interface PatternDoc {
  id: string;
  name: string;
  category: PatternCategory;
  side: Side;
  summary: string;
  problem: string;
  solution: string;
  files: string[];
  diagram: string;
}

export const PATTERNS: PatternDoc[] = [
  {
    id: 'singleton-settings',
    name: 'Singleton',
    category: 'Creacional',
    side: 'Backend',
    summary: 'Una sola configuración y una sola conexión a la base de datos para todo el servidor.',
    problem: 'Leer el .env en cada petición o abrir un pool de conexiones por endpoint gasta recursos y puede dar valores distintos en cada lugar.',
    solution: 'get_settings() está cacheado y siempre devuelve el mismo objeto Settings. Database y AIClient usan SingletonMeta, que guarda la primera instancia y la reutiliza.',
    files: ['app/core/settings.py', 'app/patterns/singleton.py', 'app/core/database.py', 'app/patterns/ai/ai_client.py'],
    diagram: `classDiagram
  class SingletonMeta {
    -_instances dict
    +__call__() instance
    +reset()
  }
  class Database {
    +engine
    +session()
  }
  class AIClient {
    +image_editor
    +advisor(fallback)
  }
  class Settings {
    +database_url
    +ai_text_provider
  }
  SingletonMeta <|-- Database : metaclass
  SingletonMeta <|-- AIClient : metaclass
  Settings <.. get_settings : lru_cache`,
  },
  {
    id: 'singleton-api',
    name: 'Singleton',
    category: 'Creacional',
    side: 'Frontend',
    summary: 'Un único cliente HTTP que guarda el token de la sesión.',
    problem: 'Si cada pantalla creara su propio cliente, habría que pasar el token a todos y avisar a cada uno cuando la sesión expire.',
    solution: 'ApiClient tiene el constructor privado y getInstance() devuelve siempre la misma instancia, que guarda el token y avisa cuando el servidor responde 401.',
    files: ['src/services/apiClient.ts'],
    diagram: `classDiagram
  class ApiClient {
    -instance$ ApiClient
    -token string
    -ApiClient(baseUrl, timeout)
    +getInstance()$ ApiClient
    +setToken(token)
    +get(path)
    +post(path, body)
    +download(path)
  }
  ApiClient --> ApiClient : instance`,
  },
  {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creacional',
    side: 'Frontend',
    summary: 'Cada tipo de mueble decide de qué piezas 3D está hecho.',
    problem: 'Un sofá, una cama y una lámpara se dibujan con piezas muy distintas. Un switch gigante con todas las formas sería difícil de mantener.',
    solution: 'FurnitureFactory define createItem() y deja a cada subclase el método buildParts(). La forma viene de la categoría guardada en la base de datos.',
    files: ['src/editor/furnitureFactory.ts'],
    diagram: `classDiagram
  class FurnitureFactory {
    <<abstract>>
    +createItem(item, position) SceneItem
    #buildParts(w, d, h, color)* Part[]
  }
  class SofaFactory {
    #buildParts()
  }
  class BedFactory {
    #buildParts()
  }
  class LampFactory {
    #buildParts()
  }
  class PlantFactory {
    #buildParts()
  }
  FurnitureFactory <|-- SofaFactory
  FurnitureFactory <|-- BedFactory
  FurnitureFactory <|-- LampFactory
  FurnitureFactory <|-- PlantFactory`,
  },
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creacional',
    side: 'Frontend',
    summary: 'Cada estilo produce una familia coherente de luz, paredes, piso y colores.',
    problem: 'Al cambiar de estilo hay que cambiar varias cosas a la vez, y deben combinar entre sí. Mezclar una pared industrial con un piso nórdico se ve mal.',
    solution: 'StyleThemeFactory crea toda la familia. CatalogStyleTheme la arma con los materiales del estilo en la base de datos y NeutralStyleTheme es la opción por defecto.',
    files: ['src/editor/styleTheme.ts'],
    diagram: `classDiagram
  class StyleThemeFactory {
    <<interface>>
    +createLighting() Lighting
    +createWallFinish() Finish
    +createFloorFinish() Finish
    +createAccentPalette() string[]
  }
  class CatalogStyleTheme
  class NeutralStyleTheme
  StyleThemeFactory <|.. CatalogStyleTheme
  StyleThemeFactory <|.. NeutralStyleTheme
  EditorWorkspace ..> StyleThemeFactory : applyStyle()`,
  },
  {
    id: 'builder-redesign',
    name: 'Builder',
    category: 'Creacional',
    side: 'Backend',
    summary: 'Arma paso a paso la petición de rediseño que se envía a la IA.',
    problem: 'Una petición a la IA tiene muchas partes opcionales (habitación, estilo, paleta, presupuesto, conservar estructura) y se debe validar antes de enviarla.',
    solution: 'RedesignRequestBuilder encadena with_photo(), in_style(), with_budget()… y build() valida todo y genera el prompt final.',
    files: ['app/patterns/builders/redesign_request_builder.py'],
    diagram: `classDiagram
  class RedesignRequestBuilder {
    +with_photo(image) Builder
    +for_room(room_type) Builder
    +in_style(style) Builder
    +with_palette(colors) Builder
    +with_budget(amount, strategy) Builder
    +keeping_structure(keep) Builder
    +build() RedesignRequest
  }
  class RedesignRequest {
    +image_prompt() str
    +advice_prompt() str
  }
  RedesignRequestBuilder --> RedesignRequest : build()
  RedesignFacade ..> RedesignRequestBuilder`,
  },
  {
    id: 'builder-room',
    name: 'Builder + Director',
    category: 'Creacional',
    side: 'Backend',
    summary: 'Construye la escena 3D inicial de cada proyecto.',
    problem: 'Un proyecto nuevo necesita habitación, materiales, luz y muebles ubicados con sentido según el tipo de habitación.',
    solution: 'RoomBuilder arma la escena parte por parte y StarterLayoutDirector sabe en qué orden y posición agregar los muebles sugeridos.',
    files: ['app/patterns/builders/room_builder.py'],
    diagram: `classDiagram
  class RoomBuilder {
    +with_walls(material) RoomBuilder
    +with_floor(material) RoomBuilder
    +with_lighting(color, intensity) RoomBuilder
    +add_furniture(item, x, z) RoomBuilder
    +build() dict
  }
  class StarterLayoutDirector {
    +furnish(items) RoomBuilder
  }
  StarterLayoutDirector --> RoomBuilder : dirige
  ProjectService ..> StarterLayoutDirector`,
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creacional',
    side: 'Frontend',
    summary: 'Duplicar un mueble, un grupo o un proyecto copia todo con identificadores nuevos.',
    problem: 'Copiar un grupo de muebles a mano obliga a conocer su estructura interna y a regenerar cada id.',
    solution: 'Cada pieza implementa clone(). En el backend, ProjectPrototype clona el proyecto completo con su escena.',
    files: ['src/editor/composite.ts', 'app/patterns/prototypes/project_prototype.py'],
    diagram: `classDiagram
  class Prototype~T~ {
    <<interface>>
    +clone() T
  }
  class FurnitureLeaf {
    +clone() SceneItem
  }
  class FurnitureGroup {
    +clone() SceneGroup
  }
  class ProjectPrototype {
    +clone(name) Project
  }
  Prototype <|.. FurnitureLeaf
  Prototype <|.. FurnitureGroup`,
  },
  {
    id: 'adapter-ai',
    name: 'Adapter',
    category: 'Estructural',
    side: 'Backend',
    summary: 'La IA es intercambiable: Gemini, Hugging Face o modo demo con la misma interfaz.',
    problem: 'Cada proveedor de IA tiene su propia API, formato y errores. El resto del sistema no debería depender de ninguno.',
    solution: 'ImageEditor y DesignAdvisor son la interfaz común. Cada adaptador traduce la API de su proveedor y se elige con AI_IMAGE_PROVIDER y AI_TEXT_PROVIDER.',
    files: ['app/patterns/ai/'],
    diagram: `classDiagram
  class ImageEditor {
    <<abstract>>
    +edit(image, prompt) ImageData
  }
  class GeminiImageEditor
  class HuggingFaceImageEditor
  class MockImageEditor
  class GeminiClient {
    +generate(model, parts, config)
  }
  ImageEditor <|-- GeminiImageEditor
  ImageEditor <|-- HuggingFaceImageEditor
  ImageEditor <|-- MockImageEditor
  GeminiImageEditor --> GeminiClient : adapta`,
  },
  {
    id: 'adapter-storage',
    name: 'Adapter',
    category: 'Estructural',
    side: 'Backend',
    summary: 'Guardar fotos en disco o en la base de datos sin cambiar el código que las usa.',
    problem: 'En desarrollo es cómodo guardar en disco, pero el disco de Render se borra en cada despliegue.',
    solution: 'StorageAdapter define save() y load(). LocalStorageAdapter y DatabaseStorageAdapter los implementan y se elige con STORAGE_PROVIDER.',
    files: ['app/patterns/storage/storage_adapter.py'],
    diagram: `classDiagram
  class StorageAdapter {
    <<abstract>>
    +save(data, content_type) url
    +load(url) ImageData
  }
  class LocalStorageAdapter
  class DatabaseStorageAdapter
  StorageAdapter <|-- LocalStorageAdapter
  StorageAdapter <|-- DatabaseStorageAdapter`,
  },
  {
    id: 'adapter-voice',
    name: 'Adapter',
    category: 'Estructural',
    side: 'Frontend',
    summary: 'Una interfaz simple para el micrófono y la voz del navegador.',
    problem: 'Cada navegador expone el reconocimiento de voz con nombres y eventos distintos, y algunos no lo tienen.',
    solution: 'VoiceAdapter envuelve SpeechRecognition y speechSynthesis en listen(), speak() y stop(), con mensajes de error en español.',
    files: ['src/assistant/voiceAdapter.ts'],
    diagram: `classDiagram
  class VoiceAdapter {
    +canListen boolean
    +canSpeak boolean
    +listen(onResult, onError, onEnd)
    +stopListening()
    +speak(text)
    +stopSpeaking()
  }
  class SpeechRecognition {
    <<browser>>
  }
  class SpeechSynthesis {
    <<browser>>
  }
  ChatPanel --> VoiceAdapter
  VoiceAdapter --> SpeechRecognition : adapta
  VoiceAdapter --> SpeechSynthesis : adapta`,
  },
  {
    id: 'decorator-ai',
    name: 'Decorator',
    category: 'Estructural',
    side: 'Backend',
    summary: 'Caché y registro de tiempos para cualquier proveedor de IA.',
    problem: 'Queremos medir cuánto tarda la IA y no repetir llamadas iguales, sin tocar el código de cada proveedor.',
    solution: 'LoggingImageEditor y CachingImageEditor envuelven a otro ImageEditor y añaden su comportamiento antes y después de delegar.',
    files: ['app/patterns/ai/ai_decorators.py'],
    diagram: `classDiagram
  class ImageEditor {
    <<abstract>>
    +edit(image, prompt)
  }
  class ImageEditorDecorator {
    -wrapped ImageEditor
    +edit(image, prompt)
  }
  class LoggingImageEditor
  class CachingImageEditor
  ImageEditor <|-- ImageEditorDecorator
  ImageEditorDecorator o-- ImageEditor : envuelve
  ImageEditorDecorator <|-- LoggingImageEditor
  ImageEditorDecorator <|-- CachingImageEditor`,
  },
  {
    id: 'decorator-addons',
    name: 'Decorator',
    category: 'Estructural',
    side: 'Frontend',
    summary: 'Cojines, manta, vidrio o luz LED se suman a un mueble sin cambiar su clase.',
    problem: 'Cada combinación de complementos cambia precio y apariencia. Crear una subclase por combinación sería imposible.',
    solution: 'BaseFurniture es el mueble y cada AddonDecorator lo envuelve sumando su precio y sus piezas 3D. Se pueden apilar varios.',
    files: ['src/editor/furnitureDecorators.ts'],
    diagram: `classDiagram
  class PricedFurniture {
    <<interface>>
    +price() number
    +parts() Part[]
  }
  class BaseFurniture
  class AddonDecorator {
    <<abstract>>
    -inner PricedFurniture
  }
  class CushionsDecorator
  class GlassTopDecorator
  class GlowDecorator
  PricedFurniture <|.. BaseFurniture
  PricedFurniture <|.. AddonDecorator
  AddonDecorator o-- PricedFurniture
  AddonDecorator <|-- CushionsDecorator
  AddonDecorator <|-- GlassTopDecorator
  AddonDecorator <|-- GlowDecorator`,
  },
  {
    id: 'facade',
    name: 'Facade',
    category: 'Estructural',
    side: 'Backend',
    summary: 'Una sola llamada para todo el proceso de rediseño.',
    problem: 'Rediseñar implica validar la foto, guardarla, llamar a la IA, calcular sugerencias y presupuesto y registrar el proyecto. El endpoint no debería orquestar todo eso.',
    solution: 'RedesignFacade.create_redesign() coordina los subsistemas y el router solo la llama.',
    files: ['app/patterns/facades/redesign_facade.py'],
    diagram: `classDiagram
  class RedesignFacade {
    +create_redesign(user, photo, options)
    +create_variation(user, id)
    +retry(user, id)
  }
  RedesignFacade --> ImageValidator
  RedesignFacade --> StorageAdapter
  RedesignFacade --> RedesignRequestBuilder
  RedesignFacade --> AIClient
  RedesignFacade --> BudgetStrategy
  RedesignsRouter --> RedesignFacade`,
  },
  {
    id: 'composite',
    name: 'Composite',
    category: 'Estructural',
    side: 'Frontend',
    summary: 'Un mueble, un grupo y la habitación completa se tratan igual.',
    problem: 'El editor permite agrupar muebles y grupos dentro de grupos. Calcular el precio o mover algo no debería depender de si es una pieza o un grupo.',
    solution: 'SceneComponent es la interfaz común. FurnitureLeaf es una pieza y FurnitureGroup contiene otros componentes y suma sus resultados.',
    files: ['src/editor/composite.ts'],
    diagram: `classDiagram
  class SceneComponent {
    <<interface>>
    +price() number
    +count() number
    +clone()
  }
  class FurnitureLeaf
  class FurnitureGroup {
    -children SceneComponent[]
  }
  class RoomComposite {
    +price() number
    +find(id)
  }
  SceneComponent <|.. FurnitureLeaf
  SceneComponent <|.. FurnitureGroup
  FurnitureGroup o-- SceneComponent : children
  RoomComposite o-- SceneComponent`,
  },
  {
    id: 'proxy-image',
    name: 'Proxy',
    category: 'Estructural',
    side: 'Frontend',
    summary: 'Las imágenes se cargan solo cuando entran en pantalla.',
    problem: 'El inicio y Mis proyectos muestran muchas fotos. Descargarlas todas al abrir la página la vuelve lenta, sobre todo en el celular.',
    solution: 'ImageProxy ocupa el lugar de la imagen real, muestra un marcador y la carga cuando el usuario se acerca a ella.',
    files: ['src/components/ImageProxy.tsx'],
    diagram: `classDiagram
  class ImageProxy {
    +src
    -visible boolean
    -loaded boolean
    +render()
  }
  class HTMLImageElement {
    <<real>>
  }
  ImageProxy --> HTMLImageElement : crea al ser visible
  ProjectCard --> ImageProxy`,
  },
  {
    id: 'proxy-admin',
    name: 'Proxy de protección',
    category: 'Estructural',
    side: 'Backend',
    summary: 'Solo un administrador puede cambiar el catálogo, y cada cambio queda registrado.',
    problem: 'Editar precios o esconder muebles afecta a todos los usuarios. Hay que verificar permisos y dejar rastro sin mezclar eso con la lógica del catálogo.',
    solution: 'CatalogAdminProxy tiene la misma interfaz que CatalogAdminService: revisa el rol del usuario, delega y registra quién cambió qué.',
    files: ['app/patterns/proxies/catalog_admin_proxy.py'],
    diagram: `classDiagram
  class CatalogAdmin {
    <<interface>>
    +create_furniture(data)
    +update_furniture(id, data)
    +update_style(id, data)
    +update_addon(id, data)
  }
  class CatalogAdminService
  class CatalogAdminProxy {
    -real CatalogAdmin
    -actor User
    -authorize()
    -audit(action, target)
  }
  CatalogAdmin <|.. CatalogAdminService
  CatalogAdmin <|.. CatalogAdminProxy
  CatalogAdminProxy --> CatalogAdminService : delega`,
  },
  {
    id: 'strategy-budget',
    name: 'Strategy',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Presupuesto económico, medio o premium.',
    problem: 'Según el dinero disponible hay que elegir productos distintos sin pasarse del presupuesto.',
    solution: 'Cada BudgetStrategy decide qué producto elegir de cada categoría. El límite entre estrategias viene del .env.',
    files: ['app/patterns/strategies/budget_strategies.py'],
    diagram: `classDiagram
  class BudgetStrategy {
    <<abstract>>
    +pick(items, budget)
    +choose(items_by_price)*
  }
  class EconomicBudget
  class StandardBudget
  class PremiumBudget
  BudgetStrategy <|-- EconomicBudget
  BudgetStrategy <|-- StandardBudget
  BudgetStrategy <|-- PremiumBudget
  RedesignFacade --> BudgetStrategy`,
  },
  {
    id: 'strategy-assistant',
    name: 'Strategy',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Lumi entiende los mensajes con Gemini o con reglas en español.',
    problem: 'La IA puede no estar disponible (sin clave, sin cuota o caída) y Lumi debe seguir funcionando.',
    solution: 'IntentInterpreter es la estrategia. GeminiIntentInterpreter usa la IA y RuleBasedInterpreter reglas propias. Se elige con AI_TEXT_PROVIDER.',
    files: ['app/patterns/assistant/interpreters.py'],
    diagram: `classDiagram
  class IntentInterpreter {
    <<abstract>>
    +interpret(message, context, vocabulary) Interpretation
  }
  class GeminiIntentInterpreter
  class RuleBasedInterpreter
  class FallbackInterpreter {
    -primary IntentInterpreter
    -fallback IntentInterpreter
  }
  IntentInterpreter <|-- GeminiIntentInterpreter
  IntentInterpreter <|-- RuleBasedInterpreter
  IntentInterpreter <|-- FallbackInterpreter
  AssistantService --> IntentInterpreter`,
  },
  {
    id: 'strategy-sort',
    name: 'Strategy',
    category: 'Comportamiento',
    side: 'Frontend',
    summary: 'Ordenar Mis proyectos por fecha, nombre o presupuesto.',
    problem: 'Cada orden compara los proyectos de forma distinta y se pueden agregar más.',
    solution: 'SORT_STRATEGIES guarda una estrategia por orden. La página solo le pide a la elegida que compare.',
    files: ['src/projects/projectQuery.ts'],
    diagram: `classDiagram
  class SortStrategy {
    <<interface>>
    +label string
    +compare(a, b) number
  }
  class Recent
  class ByName
  class ByBudget
  SortStrategy <|.. Recent
  SortStrategy <|.. ByName
  SortStrategy <|.. ByBudget
  ProjectsPage --> SortStrategy`,
  },
  {
    id: 'chain-images',
    name: 'Chain of Responsibility',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'La foto pasa por formato, tamaño, resolución y contenido.',
    problem: 'Hay varias reglas para aceptar una foto y cada una tiene su propio mensaje de error.',
    solution: 'Cada ImageValidator revisa una cosa y pasa la foto al siguiente con then(). Si algo falla, corta la cadena con un mensaje claro.',
    files: ['app/patterns/validators/image_validators.py'],
    diagram: `classDiagram
  class ImageValidator {
    -next ImageValidator
    +then(validator) ImageValidator
    +validate(upload)
    #check(upload)*
  }
  class FormatValidator
  class SizeValidator
  class ResolutionValidator
  class ContentValidator
  ImageValidator <|-- FormatValidator
  ImageValidator <|-- SizeValidator
  ImageValidator <|-- ResolutionValidator
  ImageValidator <|-- ContentValidator
  ImageValidator --> ImageValidator : next`,
  },
  {
    id: 'chain-assistant',
    name: 'Chain of Responsibility',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Si Gemini falla, el mensaje pasa a las reglas.',
    problem: 'Un error de la IA no debería dejar al usuario sin respuesta.',
    solution: 'FallbackInterpreter intenta con el primer intérprete y, ante un error de IA, pasa la petición al siguiente.',
    files: ['app/patterns/assistant/interpreters.py'],
    diagram: `sequenceDiagram
  participant U as Usuario
  participant F as FallbackInterpreter
  participant G as GeminiIntentInterpreter
  participant R as RuleBasedInterpreter
  U->>F: "agrega una planta"
  F->>G: interpret()
  G-->>F: AIError (sin cuota)
  F->>R: interpret()
  R-->>F: add_furniture(planta)
  F-->>U: respuesta + acción`,
  },
  {
    id: 'command',
    name: 'Command',
    category: 'Comportamiento',
    side: 'Frontend',
    summary: 'Deshacer y rehacer en el editor 3D.',
    problem: 'Cada cambio del editor (agregar, mover, rotar, pintar, agrupar) debe poder revertirse en orden.',
    solution: 'Cada acción es un objeto con execute() y undo(). CommandHistory guarda las pilas de deshacer y rehacer con un límite configurable.',
    files: ['src/editor/commands.ts'],
    diagram: `classDiagram
  class Command {
    <<interface>>
    +label string
    +execute(scene) Scene
    +undo(scene) Scene
  }
  class AddNodesCommand
  class MoveNodeCommand
  class RotateNodeCommand
  class UpdateSceneCommand
  class CommandHistory {
    -done Command[]
    -undone Command[]
    +execute(command, scene)
    +undo(scene)
    +redo(scene)
  }
  Command <|.. AddNodesCommand
  Command <|.. MoveNodeCommand
  Command <|.. RotateNodeCommand
  Command <|.. UpdateSceneCommand
  CommandHistory o-- Command
  EditorStore --> CommandHistory`,
  },
  {
    id: 'memento',
    name: 'Memento',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Versiones guardadas de cada escena 3D.',
    problem: 'El usuario quiere guardar puntos de su diseño y volver a ellos sin exponer cómo se guarda la escena.',
    solution: 'ProjectSceneOriginator crea y restaura SceneMemento. SceneVersionRepository es el cuidador y conserva solo las últimas versiones.',
    files: ['app/patterns/mementos/scene_memento.py', 'app/repositories/project_repository.py'],
    diagram: `classDiagram
  class ProjectSceneOriginator {
    +create_memento(label) SceneMemento
    +restore(memento)
  }
  class SceneMemento {
    +label
    +scene
    +estimated_budget
  }
  class SceneVersionRepository {
    +list_by_project(id)
    +keep_latest(project_id, limit)
  }
  ProjectSceneOriginator --> SceneMemento : crea
  SceneVersionRepository o-- SceneMemento : cuida`,
  },
  {
    id: 'observer',
    name: 'Observer',
    category: 'Comportamiento',
    side: 'Frontend',
    summary: 'Avisos, editor y Lumi se comunican sin conocerse.',
    problem: 'Muchas partes reaccionan a lo mismo: el lienzo y los paneles al cambio de escena, cualquier pantalla a un aviso, el editor a una orden de Lumi.',
    solution: 'notificationCenter, editorStore, chatStore y assistantBus permiten suscribirse y publicar. Lumi publica sus acciones y quien puede ejecutarlas las atiende.',
    files: ['src/services/notificationCenter.ts', 'src/editor/editorStore.ts', 'src/assistant/assistantBus.ts', 'src/assistant/chatStore.ts'],
    diagram: `classDiagram
  class AssistantBus {
    -handlers Set
    +subscribe(handler) unsubscribe
    +publish(action) boolean
  }
  class ChatStore {
    +send(text, context)
  }
  class AssistantActions {
    navigate / open_project
  }
  class EditorWorkspace {
    add_furniture / change_wall / undo
  }
  ChatStore --> AssistantBus : publish
  AssistantActions ..> AssistantBus : subscribe
  EditorWorkspace ..> AssistantBus : subscribe`,
  },
  {
    id: 'state-project',
    name: 'State',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Borrador, en diseño y terminado.',
    problem: 'Lo que se puede hacer con un proyecto depende de su estado. Un proyecto terminado no se puede editar hasta reabrirlo.',
    solution: 'Cada estado es una clase que decide qué acciones permite. ProjectLifecycle delega en el estado actual.',
    files: ['app/patterns/states/project_states.py', 'app/patterns/states/redesign_states.py'],
    diagram: `stateDiagram-v2
  state "Borrador" as Draft
  state "En diseño" as InDesign
  state "Terminado" as Finished
  [*] --> Draft
  Draft --> InDesign : editar o start
  InDesign --> Finished : finish
  Finished --> InDesign : reopen
  Finished --> Finished : editar es rechazado`,
  },
  {
    id: 'template-method',
    name: 'Template Method',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Reportes CSV de usuarios y proyectos.',
    problem: 'Todos los reportes siguen los mismos pasos (encabezados, filas, formato, nombre del archivo) y solo cambia qué datos traen.',
    solution: 'ReportExporter.export() fija el algoritmo y cada reporte implementa columns(), records() y to_row().',
    files: ['app/patterns/reports/report_exporters.py'],
    diagram: `classDiagram
  class ReportExporter {
    <<abstract>>
    +export() file
    +file_name() str
    +format_value(value) str
    +columns()* list
    +records()* iterable
    +to_row(record)* list
  }
  class UsersReport
  class ProjectsReport
  ReportExporter <|-- UsersReport
  ReportExporter <|-- ProjectsReport`,
  },
  {
    id: 'visitor',
    name: 'Visitor',
    category: 'Comportamiento',
    side: 'Backend',
    summary: 'Recorre la escena para calcular el presupuesto real.',
    problem: 'El presupuesto debe calcularse en el servidor con los precios de la base de datos, recorriendo habitación, grupos y muebles.',
    solution: 'Cada SceneVisitor define visit_room(), visit_group() y visit_item(). BudgetVisitor suma precios y FurnitureIdCollector reúne los muebles usados.',
    files: ['app/patterns/visitors/scene_visitors.py'],
    diagram: `classDiagram
  class SceneVisitor {
    <<abstract>>
    +visit_room(room)*
    +visit_group(group)*
    +visit_item(item)*
  }
  class BudgetVisitor {
    +total
  }
  class FurnitureIdCollector {
    +ids
  }
  SceneVisitor <|-- BudgetVisitor
  SceneVisitor <|-- FurnitureIdCollector`,
  },
  {
    id: 'repository',
    name: 'Repository',
    category: 'Arquitectura',
    side: 'Backend',
    summary: 'Los servicios piden y guardan datos sin escribir SQL.',
    problem: 'Mezclar consultas SQL con la lógica de negocio hace el código difícil de leer y de probar.',
    solution: 'BaseRepository ofrece get, list, add y delete. Cada repositorio agrega consultas propias como search() o daily_counts().',
    files: ['app/repositories/'],
    diagram: `classDiagram
  class BaseRepository~T~ {
    +get(id) T
    +list() T[]
    +add(entity) T
    +delete(entity)
  }
  class UserRepository {
    +get_by_email(email)
    +search(text, limit, offset)
  }
  class ProjectRepository {
    +list_by_user(id)
  }
  BaseRepository <|-- UserRepository
  BaseRepository <|-- ProjectRepository
  AdminService --> UserRepository`,
  },
];

export const ARCHITECTURE_DIAGRAM = `flowchart LR
  FE["Frontend<br/>React + TypeScript<br/>Vercel"] -- "REST + JWT" --> R
  subgraph BE["Backend · FastAPI · Render"]
    direction TB
    R[Routers] --> S[Services]
    S --> RP[Repositories]
    RP --> M[Models]
  end
  S -- Adapter --> AI["IA intercambiable<br/>Gemini · Hugging Face · demo"]
  M --> DB[("PostgreSQL<br/>Neon")]`;

export const ER_DIAGRAM = `erDiagram
  users ||--o{ projects : owns
  users ||--o{ chat_messages : writes
  projects ||--o{ redesigns : has
  projects ||--o{ scene_versions : keeps
  design_styles ||--o{ projects : styles
  room_types ||--o{ projects : classifies
  design_styles ||--o{ color_palettes : offers
  design_styles }o--o{ materials : style_materials
  furniture_categories ||--o{ furniture_items : groups
  users {
    uuid id PK
    string full_name
    string email UK
    string password_hash
    string role
    bool is_active
    datetime last_login_at
  }
  projects {
    uuid id PK
    uuid user_id FK
    int room_type_id FK
    int style_id FK
    string name
    string status
    decimal estimated_budget
    json scene
  }
  redesigns {
    uuid id PK
    uuid project_id FK
    int style_id FK
    string original_image_url
    string result_image_url
    string status
    json suggestions
  }
  scene_versions {
    int id PK
    uuid project_id FK
    string label
    json scene
  }
  chat_messages {
    int id PK
    uuid user_id FK
    string sender
    text content
    string intent
    json payload
  }
  design_styles {
    int id PK
    string slug UK
    string name
    string lighting_color
    float lighting_intensity
    bool is_active
  }
  furniture_items {
    int id PK
    int category_id FK
    string name
    decimal price
    float width
    float depth
    float height
    bool is_active
  }
  furniture_categories {
    int id PK
    string slug UK
    string shape
  }
  furniture_addons {
    int id PK
    string slug UK
    decimal price
    json categories
  }
  materials {
    int id PK
    string slug UK
    string surface
    decimal price_per_unit
  }
  room_types {
    int id PK
    string slug UK
    string name
  }
  color_palettes {
    int id PK
    int style_id FK
    json colors
  }
  stored_files {
    uuid id PK
    string content_type
    int size_bytes
    bytes data
  }`;
