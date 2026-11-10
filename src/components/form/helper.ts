import { inputValidationHelper } from "../ui/input/helper";
import { getFieldError } from "./validation";

export type FormValues = Record<string, FormDataEntryValue>;

export const formData = (form: HTMLFormElement): FormValues => {
  const data: FormValues = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string" ? value.length > 0 : value.name.length > 0) {
      data[key] = value;
    }
  });
  return data;
};

export const validateInput = (form: HTMLFormElement, input: HTMLInputElement): boolean => {
  const newPassword = form.querySelector<HTMLInputElement>(
    '[name="new_password"]',
  )?.value;
  const error = getFieldError(input.name, input.value, newPassword);
  inputValidationHelper(input, error);
  return error === null;
};
