export class Mode {
  constructor() {
    this.mode = 'DIRECT';
    this.radio = document.querySelectorAll('input[name="mode"]');
    this.onChange();
  }
  setCurrentMode(mode) {
    this.mode = mode;
  }
  getCurrentMode() {
    return this.mode;
  }
  onChange() {
    this.radio.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const mode = e.target.dataset['mode'];
        this.setCurrentMode(mode);
      });
    });
  }
}