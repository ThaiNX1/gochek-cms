import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {MyTemplateDirective} from "./directives/my-template.directive";
import {AutoTabDirective} from "./directives/auto-tab.directive";
import {FocusElementDirective} from "./directives/focus.directive";
import { PermissionDirective } from "./directives/permission.directive";

@NgModule({
  declarations: [
    MyTemplateDirective,
    AutoTabDirective,
    FocusElementDirective,
    PermissionDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MyTemplateDirective,
    AutoTabDirective,
    FocusElementDirective,
    PermissionDirective
  ]
})
export class DirectiveModule {
}
