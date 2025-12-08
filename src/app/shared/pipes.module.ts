import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShortNamePipe} from "./pipes/short-name.pipe";
import {HighlightSearch} from "./pipes/highlight.pipe";
import {SafeHtmlPipe} from "./pipes/safe-html.pipe";


@NgModule({
  declarations: [
    ShortNamePipe,
    HighlightSearch,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ShortNamePipe,
    HighlightSearch,
    SafeHtmlPipe
  ]
})
export class PipesModule {
}
