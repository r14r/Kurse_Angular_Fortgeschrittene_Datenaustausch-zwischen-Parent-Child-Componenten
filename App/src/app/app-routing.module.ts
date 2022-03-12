import { NgModule } from "@angular/core";

import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./pages/home/component";
import { IntroComponent } from "./pages/intro/component";

const routes: Routes = [
	{ path: "home", component: HomeComponent },
	{ path: "intro", component: IntroComponent },
	{ path: "", redirectTo: "/intro", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
