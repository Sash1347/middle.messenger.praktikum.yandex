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

export const isSupportedChatImage = (file: File): boolean =>
  !file.type || ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type);

export function showCreateChatPopup(): Promise<{ title: string; avatar: File | null } | null> {
  return new Promise((resolve) => {
    const dialog = createDialog("New chat", "Choose a name and optionally an image.");
    const form = document.createElement("form");
    form.noValidate = true;
    const name = document.createElement("input");
    name.className = "popup-dialog__input";
    name.type = "text";
    name.setAttribute("aria-label", "Chat name");
    const label = document.createElement("label");
    label.className = "popup-dialog__file-label";
    label.textContent = "Chat image (optional)";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/jpeg,image/png,image/gif,image/webp";
    label.append(file);
    const validation = document.createElement("span");
    validation.className = "popup-dialog__validation";
    validation.setAttribute("aria-live", "polite");
    const actions = document.createElement("div");
    actions.className = "popup-dialog__actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "popup-dialog__button popup-dialog__button--secondary";
    cancel.textContent = "Cancel";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "popup-dialog__button";
    submit.textContent = "Create";
    let settled = false;
    const finish = (result: { title: string; avatar: File | null } | null) => {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(result);
    };
    cancel.addEventListener("click", () => finish(null));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = name.value.trim();
      const avatar = file.files?.[0] ?? null;
      if (!title) {
        validation.textContent = "Enter a chat name.";
        name.focus();
      } else if (avatar && !isSupportedChatImage(avatar)) {
        validation.textContent = "Choose a JPEG, PNG, GIF or WebP image.";
        file.focus();
      } else {
        finish({ title, avatar });
      }
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) finish(null);
    });
    actions.append(cancel, submit);
    form.append(name, label, validation, actions);
    dialog.append(form);
    document.body.append(dialog);
    dialog.showModal();
    name.focus();
  });
}

export interface PopupMember {
  id: number;
  name: string;
  login: string;
  avatar: string | null;
}

export function showMembersPopup(
  members: PopupMember[],
  currentUserId: number,
): Promise<number | null> {
  return new Promise((resolve) => {
    const dialog = createDialog("Chat members", "Members of this chat.");
    let settled = false;
    const finish = (id: number | null) => {
      if (settled) return;
      settled = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(id);
    };

    const list = document.createElement("div");
    list.className = "popup-dialog__members";
    if (members.length === 0) list.textContent = "No members.";
    members.forEach((member) => {
      const row = document.createElement("div");
      row.className = "popup-dialog__member";
      const emptyAvatar = () => {
        const placeholder = document.createElement("span");
        placeholder.className = "popup-dialog__member-avatar";
        placeholder.setAttribute("aria-hidden", "true");
        return placeholder;
      };
      let avatar: HTMLElement = emptyAvatar();
      if (member.avatar) {
        const image = document.createElement("img");
        image.className = "popup-dialog__member-avatar";
        image.alt = "";
        image.crossOrigin = "use-credentials";
        image.addEventListener("error", () => image.replaceWith(emptyAvatar()), { once: true });
        image.src = member.avatar;
        avatar = image;
      }
      const details = document.createElement("span");
      details.className = "popup-dialog__member-details";
      const name = document.createElement("span");
      name.textContent = member.name;
      const login = document.createElement("small");
      login.textContent = `@${member.login}`;
      details.append(name, login);
      row.append(avatar, details);
      if (member.id !== currentUserId) {
        const removeButton = document.createElement("button");
        removeButton.className = "popup-dialog__button popup-dialog__button--danger popup-dialog__member-remove";
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", `Remove ${member.name} (@${member.login})`);
        removeButton.addEventListener("click", () => finish(member.id));
        row.append(removeButton);
      }
      list.append(row);
    });

    const actions = document.createElement("div");
    actions.className = "popup-dialog__actions";
    const cancelButton = document.createElement("button");
    cancelButton.className = "popup-dialog__button popup-dialog__button--secondary";
    cancelButton.type = "button";
    cancelButton.textContent = "Close";
    cancelButton.addEventListener("click", () => finish(null));
    actions.append(cancelButton);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) finish(null);
    });
    dialog.append(list, actions);
    document.body.append(dialog);
    dialog.showModal();
    cancelButton.focus();
  });
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
