/**
 * AK Racing - Keyboard Shortcuts & Hotkey Guide Modal
 * Press '?' or click Help to toggle an interactive cybernetic cheat sheet.
 */
export class ShortcutsModal {
  constructor() {
    this.isOpen = false;
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    let modal = document.getElementById('ak-shortcuts-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ak-shortcuts-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="bg-carbon border border-fire-orange/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
          <button id="close-shortcuts-btn" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
          <h3 class="text-2xl font-bold text-fire-orange font-orbitron mb-4">⌨️ TELEMETRY HOTKEYS</h3>
          <div class="grid grid-cols-2 gap-3 text-sm font-rajdhani">
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">W / Space</span>: Throttle</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">S / Down</span>: Brake</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">E</span>: Shift UP</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">Q</span>: Shift DOWN</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">M</span>: Move Speedometer</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">N</span>: Hybrid Boost</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">L</span>: Launch Control</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">B</span>: Burnout Mode</div>
            <div class="p-2 bg-white/5 rounded"><span class="font-bold text-fire-amber">?</span>: Toggle This Menu</div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    this.modalEl = modal;
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const closeBtn = document.getElementById('close-shortcuts-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      this.isOpen = true;
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      this.isOpen = false;
    }
  }
}
