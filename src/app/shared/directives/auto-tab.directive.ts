import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appAutoTab]'
})
export class AutoTabDirective {
  @Input('appAutoTab') appAutoTab: any;

  constructor(
    private element: ElementRef,
  ) {
  }

  @HostListener('input', ['$event.target']) onInput(input: any) {
    const length = input.value.length;
    const maxLength = input.attributes.maxlength.value;
    if (length >= maxLength) {
      this.appAutoTab.focus();
    }
  }
}
