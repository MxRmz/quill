import Embed from '../blots/embed.js';
import Emitter from './emitter.js';
class Composition {
  isComposing = false;
  isUndoing = false; // Add this property

  constructor(scroll, emitter) {
    this.scroll = scroll;
    this.emitter = emitter;
    this.setupListeners();
  }
  setupListeners() {
    // On beforeinput: check for destructive actions like delete or undo.
    // This gives us context before the composition events fire.
    this.scroll.domNode.addEventListener('beforeinput', event => {
      const inputType = event.inputType;
      // Check for common input types that represent deletion or undoing history.
      if (inputType.startsWith('delete') || inputType.startsWith('history')) {
        this.isUndoing = true;
      }
    });

    // On compositionstart: enter batch mode ONLY for genuine compositions.
    this.scroll.domNode.addEventListener('compositionstart', event => {
      // If a destructive action was just detected, do NOT enter batch mode.
      // Let Quill handle the deletion synchronously.
      if (this.isUndoing) {
        this.isUndoing = false; // Reset the flag
        return;
      }
      if (!this.isComposing) {
        this.isComposing = true;
        // This is a genuine composition, so we start the batch.
        this.scroll.batchStart();
        this.handleCompositionStart(event);
      }
    });

    // On compositionend: exit batch mode and apply changes immediately.
    this.scroll.domNode.addEventListener('compositionend', event => {
      if (this.isComposing) {
        // Use microtask to wait for DOM update, then flush.
        setTimeout(() => {
          this.handleCompositionEnd(event);
          // This will only be called if batchStart() was called,
          // which we now prevent for deletions.
          this.scroll.batchEnd();
          this.isComposing = false;

          // It's good practice to ensure the isUndoing flag is reset here too,
          // in case an unusual event sequence occurs.
          this.isUndoing = false;
        }, 0);
      }
    });
  }
  handleCompositionStart(event) {
    const blot = event.target instanceof Node ? this.scroll.find(event.target, true) : null;
    if (blot && !(blot instanceof Embed)) {
      this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_START, event);
      this.scroll.batchStart();
      this.emitter.emit(Emitter.events.COMPOSITION_START, event);
      this.isComposing = true;
    }
  }
  handleCompositionEnd(event) {
    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
  }
}
export default Composition;
//# sourceMappingURL=composition.js.map