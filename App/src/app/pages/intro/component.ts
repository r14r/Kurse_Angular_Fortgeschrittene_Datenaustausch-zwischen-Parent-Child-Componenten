import { Component, OnInit } from "@angular/core";

@Component({
	selector: "app-intro",
	templateUrl: "./component.html",
	styleUrls: ["./component.scss"],
})
export class IntroComponent implements OnInit {
	title = "TEMPLATE_ANGULAR";

	constructor() {}

	ngOnInit(): void {}
}
