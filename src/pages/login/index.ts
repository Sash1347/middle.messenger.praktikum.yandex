import template from "./index.hbs?raw";

import "../../components/form";
import { renderPage, type RenderContent } from '../render';

import { loginFormSubmit } from "./helper";

import "./index.scss";


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

export default function RenderLoginContent(renderToHtml: RenderContent) {
  return renderPage(template, {
    fields: formFields, button: formButton, onSubmit: loginFormSubmit,
  }, renderToHtml);
}
