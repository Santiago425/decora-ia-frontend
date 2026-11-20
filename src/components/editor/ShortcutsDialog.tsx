import { SHORTCUTS } from '../../editor/editorMediator';
import { Button, Modal } from '../ui';

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      title="Atajos del editor"
      onClose={onClose}
      className="shortcuts-dialog"
      footer={<Button onClick={onClose}>Entendido</Button>}
    >
      <p className="shortcuts-intro">En Mac usa ⌘ en lugar de Ctrl.</p>
      <dl className="shortcut-list">
        {SHORTCUTS.map(({ keys, label }) => (
          <div key={label}>
            <dt>
              {keys.map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
