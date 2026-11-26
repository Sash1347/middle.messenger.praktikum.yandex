import template from "./index.hbs?raw";

import "../../components/form";
import { renderPage, type RenderContent } from '../render';
import { changePasswordFormSubmit } from "./helper";

import "./index.scss";

const formFields = [
  {
    type: "password",
    id: "old_password",
    name: "old_password",
    label: "Current Password",
    placeholder: "Enter your current password",
    value: "",
  },
  {
    type: "password",
    id: "new_password",
    name: "new_password",
    label: "New Password",
    placeholder: "Enter your new password",
    value: "",
  },
  {
    type: "password",
    id: "confirm_password",
    name: "confirm_password",
    label: "Confirm Password",
    placeholder: "Confirm your new password",
    value: "",
  },
];

const formButton = {
  text: "Change Password",
  className: "change-password__button",
};

export default function RenderChangePasswordContent(renderToHtml: RenderContent) {
  return renderPage(template, {
    fields: formFields, button: formButton, onSubmit: changePasswordFormSubmit,
  }, renderToHtml);
}
