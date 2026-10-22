import Handlebars from "handlebars";
import template from "./index.hbs?raw";

import Form from "../../components/form";

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

export default function RenderLoginContent(renderToHtml: (html: string) => void) {
  renderToHtml(renderContent({ form: Form({ fields: formFields, button: formButton }) }));
  const form = document.querySelector('form');
  if (!form) throw new Error('Login form not found');
  return loginFormSubmit(form);
}
