import {AfterViewChecked, AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
    selector: '[focusElement]'
})
export class FocusElementDirective implements AfterViewInit {

    constructor(
        private element: ElementRef
    ) {
    }

    ngAfterViewInit() {
        setTimeout(()=>{
            this.element.nativeElement.focus();
        },100)
    }

    ngAfterViewChecked(): void {
        // this.element.nativeElement.focus();
    }
}
