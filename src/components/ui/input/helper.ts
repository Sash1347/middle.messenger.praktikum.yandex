const inputValidationHelper = (input: HTMLInputElement, error: boolean) => {
  const errorElement = document.getElementById(`${input.id}_error`);
  input.setAttribute("aria-invalid", String(error));
  if (errorElement && error) {
    errorElement.classList.add("input_field_error_visible");
    errorElement.textContent = `validation error`;
  } else {
    const errorElement = document.getElementById(`${input.id}_error`);
    if (errorElement) {
      errorElement.classList.remove("input_field_error_visible");
      errorElement.textContent = "";
    }
  }
};

export { inputValidationHelper };
