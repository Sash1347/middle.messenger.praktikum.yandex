import Handlebars from "handlebars";
import template from "./index.hbs?raw";

import Form from "../../components/form";
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

const renderContent = Handlebars.compile(template);

export default function RenderChangePasswordContent(renderToHtml: (html: string) => void) {
  renderToHtml(renderContent({ form: new Form({ fields: formFields, button: formButton }).element()?.outerHTML ?? '' }));
  const form = document.querySelector('form');
  if (!form) throw new Error('Change password form not found');
  return changePasswordFormSubmit(form);
}
