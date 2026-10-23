const inputValidationHelper = (input: HTMLInputElement, error: string | null): void => {
  const errorId = input.getAttribute("aria-describedby");
  const errorElement = errorId ? input.ownerDocument.getElementById(errorId) : null;
  if (!errorElement) throw new Error(`Validation message element not found for input: ${input.name}`);

  input.setAttribute("aria-invalid", String(error !== null));
  errorElement.classList.toggle("input_field_error_visible", error !== null);
  errorElement.textContent = error ?? "";
};

export { inputValidationHelper };
