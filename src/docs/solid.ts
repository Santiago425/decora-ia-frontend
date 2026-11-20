export interface SolidPrinciple {
  letter: string;
  name: string;
  idea: string;
  example: string;
  files: string[];
  patterns: string[];
}

export const SOLID: SolidPrinciple[] = [
  {
    letter: 'S',
    name: 'Responsabilidad única',
    idea: 'Cada clase tiene un solo motivo para cambiar.',
    example:
      'Los routers solo reciben la petición, los servicios deciden y los repositorios hablan con la base de datos. Si cambia una consulta, solo se toca el repositorio.',
    files: ['app/routers/', 'app/services/', 'app/repositories/'],
    patterns: ['repository'],
  },
  {
    letter: 'O',
    name: 'Abierto/cerrado',
    idea: 'Se puede extender sin modificar lo que ya funciona.',
    example:
      'Para sumar un proveedor de IA se agrega una fábrica nueva y se registra; AIClient, el rediseño y Lumi no cambian. Lo mismo con un formato de reporte nuevo.',
    files: ['app/patterns/ai/provider_factories.py', 'app/patterns/reports/report_exporters.py'],
    patterns: ['abstract-factory-ai', 'bridge-reports'],
  },
  {
    letter: 'L',
    name: 'Sustitución de Liskov',
    idea: 'Cualquier implementación puede reemplazar a otra sin romper a quien la usa.',
    example:
      'GeminiImageEditor, CloudflareImageEditor, HuggingFaceImageEditor y MockImageEditor son intercambiables: el .env elige cuál se usa y el rediseño funciona igual con cualquiera. El respaldo simulado solo entra si se activa con AI_IMAGE_FALLBACK; si no, el error del proveedor se muestra tal cual.',
    files: ['app/patterns/ai/ai_provider.py', 'app/patterns/ai/ai_decorators.py'],
    patterns: ['adapter-ai', 'decorator-ai'],
  },
  {
    letter: 'I',
    name: 'Segregación de interfaces',
    idea: 'Interfaces pequeñas: nadie depende de métodos que no usa.',
    example:
      'ImageEditor solo sabe editar fotos y DesignAdvisor solo sugiere muebles. Cloudflare y Hugging Face implementan la primera sin fingir que saben dar consejos.',
    files: ['app/patterns/ai/ai_provider.py'],
    patterns: ['adapter-ai'],
  },
  {
    letter: 'D',
    name: 'Inversión de dependencias',
    idea: 'Lo importante depende de abstracciones, no de detalles.',
    example:
      'Los servicios reciben repositorios, intérpretes y almacenamiento por inyección de dependencias (Depends). En las pruebas se cambian por versiones falsas sin tocar el servicio.',
    files: ['app/dependencies.py', 'src/services/apiClient.ts'],
    patterns: ['strategy-assistant', 'adapter-storage'],
  },
];
