import type Scroll from '../blots/scroll.js';
import Emitter from './emitter.js';
declare class Composition {
    private scroll;
    private emitter;
    isComposing: boolean;
    private isUndoing;
    constructor(scroll: Scroll, emitter: Emitter);
    private setupListeners;
    private handleCompositionStart;
    private handleCompositionEnd;
}
export default Composition;
