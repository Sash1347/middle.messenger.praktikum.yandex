import { inputValidationHelper } from "../ui/input/helper";
import { isFieldValid } from "./validation";

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

export const bindForm = (
  form: HTMLFormElement,
  onSubmit: (data: FormValues) => void,
): (() => void) => {
  const controller = new AbortController();
  const { signal } = controller;
  form.noValidate = true;

  const validateInput = (input: HTMLInputElement): boolean => {
    const newPassword = form.querySelector<HTMLInputElement>(
      '[name="new_password"]',
    )?.value;
    const valid = isFieldValid(input.name, input.value, newPassword);
    inputValidationHelper(input, !valid);
    return valid;
  };

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener(
      "blur",
      () => {
        validateInput(input);
        if (input.name === "new_password") {
          const confirmation = form.querySelector<HTMLInputElement>(
            '[name="confirm_password"]',
          );
          if (confirmation?.value) validateInput(confirmation);
        }
      },
      { signal },
    );
  });

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const results = Array.from(form.querySelectorAll("input"), validateInput);
      if (!results.every(Boolean)) return;

      onSubmit(formData(form));
    },
    { signal },
  );

  return () => controller.abort();
};
