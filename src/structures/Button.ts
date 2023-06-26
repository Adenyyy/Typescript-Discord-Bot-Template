import { ButtonType } from "../typings/Button";

export class Button {
    constructor(commandOptions: ButtonType) {
        Object.assign(this, commandOptions);
    }
}
