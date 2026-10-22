import Handlebars from "handlebars";
import template from "./index.hbs?raw";

import Form from "../../components/form";
import Page from "../../components/page";

import { loginFormSubmit } from "./helper";

import "./index.scss";


const renderContent = Handlebars.compile(template);

const formFields = [
  {
    type: "text",
    id: "login",
    name: "login",
    label: "Login",
    placeholder: "Enter your login",
    value: "",
  },
  {
    type: "password",
    id: "password",
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    value: "",
  },
];

const formButton = {
  text: "Sign in",
};

export default class LoginPage extends Page {
  protected render(): string {
    return renderContent({ form: '<div id="form-host"></div>' });
  }

  protected componentDidMount(): void {
    const form = new Form({ fields: formFields, button: formButton, setup: loginFormSubmit });
    this.mountChild(form, '#form-host');
  }
}
