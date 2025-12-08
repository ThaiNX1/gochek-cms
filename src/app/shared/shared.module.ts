import {NgModule} from "@angular/core";
import {DirectiveModule} from "./directive.module";
import {PipesModule} from "./pipes.module";

@NgModule({
  imports: [
    DirectiveModule,
    PipesModule
  ],
  exports: [
    DirectiveModule,
    PipesModule
  ]
})
export class SharedModule {
}
