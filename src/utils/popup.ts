import "./popup.scss";

type PopupType = "success" | "error";

const POPUP_DURATION = 3200;
let popupContainer: HTMLElement | null = null;

function getPopupContainer(): HTMLElement {
  if (popupContainer?.isConnected) return popupContainer;

  popupContainer = document.createElement("div");
  popupContainer.className = "popup-stack";
  popupContainer.setAttribute("aria-live", "polite");
  popupContainer.setAttribute("aria-relevant", "additions");
  document.body.append(popupContainer);
  return popupContainer;
}

function showPopup(message: string, type: PopupType): Promise<void> {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.className = `popup popup--${type}`;
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

    const icon = document.createElement("span");
    icon.className = "popup__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = type === "success" ? "+" : "!";

    const text = document.createElement("span");
    text.className = "popup__message";
    text.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "popup__close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Dismiss notification");
    closeButton.textContent = "x";

    popup.append(icon, text, closeButton);
    getPopupContainer().append(popup);

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      window.clearTimeout(timeout);
      popup.classList.add("popup--leaving");
      window.setTimeout(() => {
        popup.remove();
        if (popupContainer?.childElementCount === 0) {
          popupContainer.remove();
          popupContainer = null;
        }
        resolve();
      }, 180);
    };

    closeButton.addEventListener("click", dismiss, { once: true });
    const timeout = window.setTimeout(dismiss, POPUP_DURATION);
  });
}

export function showSuccessPopup(message: string = "Success!"): Promise<void> {
  return showPopup(message, "success");
}

export function showErrorPopup(message: string): Promise<void> {
  return showPopup(message, "error");
}

function createDialog(title: string, message: string): HTMLDialogElement {
  const dialog = document.createElement("dialog");
  dialog.className = "popup-dialog";

  const heading = document.createElement("h2");
  heading.className = "popup-dialog__title";
  heading.textContent = title;

  const description = document.createElement("p");
  description.className = "popup-dialog__message";
  description.textContent = message;

  dialog.append(heading, description);
  return dialog;
}

export function showPromptPopup(
  title: string,
  message: string,
): Promise<string | null> {
  return new Promise((resolve) => {
    const dialog = createDialog(title, message);
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(value);
    };

    const form = document.createElement("form");
    form.noValidate = true;
    const input = document.createElement("input");
    input.className = "popup-dialog__input";
    input.type = "text";
    input.autocomplete = "off";
    input.setAttribute("aria-label", message);

    const validationMessage = document.createElement("span");
    validationMessage.className = "popup-dialog__validation";
    validationMessage.setAttribute("aria-live", "polite");

    const actions = document.createElement("div");
    actions.className = "popup-dialog__actions";

    const cancelButton = document.createElement("button");
    cancelButton.className =
      "popup-dialog__button popup-dialog__button--secondary";
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    const submitButton = document.createElement("button");
    submitButton.className = "popup-dialog__button";
    submitButton.type = "submit";
    submitButton.textContent = "Continue";

    cancelButton.addEventListener("click", () => finish(null));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        validationMessage.textContent = "This field is required.";
        input.focus();
        return;
      }
      finish(value);
    });
    input.addEventListener("input", () => {
      validationMessage.textContent = "";
    });
    dialog.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();
        finish(null);
      },
      { once: true },
    );
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) finish(null);
      },
      { once: true },
    );

    actions.append(cancelButton, submitButton);
    form.append(input, validationMessage, actions);
    dialog.append(form);
    document.body.append(dialog);
    dialog.showModal();
    input.focus();
  });
}

export function showConfirmPopup(
  title: string,
  message: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = createDialog(title, message);
    let settled = false;
    const finish = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(confirmed);
    };

    const actions = document.createElement("div");
    actions.className = "popup-dialog__actions";

    const cancelButton = document.createElement("button");
    cancelButton.className =
      "popup-dialog__button popup-dialog__button--secondary";
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => finish(false));

    const confirmButton = document.createElement("button");
    confirmButton.className =
      "popup-dialog__button popup-dialog__button--danger";
    confirmButton.type = "button";
    confirmButton.textContent = "Delete";
    confirmButton.addEventListener("click", () => finish(true));

    actions.append(cancelButton, confirmButton);
    dialog.append(actions);
    dialog.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();
        finish(false);
      },
      { once: true },
    );
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) finish(false);
      },
      { once: true },
    );
    document.body.append(dialog);
    dialog.showModal();
    cancelButton.focus();
  });
}
