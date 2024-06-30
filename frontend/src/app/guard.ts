import { ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, CanDeactivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { EditComponent } from "./components/edit.component";
import { NewEntryComponent } from "./components/new-entry.component";

export const leaveEditPage: CanDeactivateFn<EditComponent> =
(comp: EditComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree>  => {

    if (comp.isFormDirty())
        return confirm('You have not saved your form. Are you sure?')
    
    return true
    
}

export const leaveNewPage: CanDeactivateFn<NewEntryComponent> =
(comp: NewEntryComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree>  => {

    if (comp.isFormDirty())
        return confirm('You have not saved your form. Are you sure?')
    
    return true
    
}