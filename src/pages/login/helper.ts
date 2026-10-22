import { bindForm } from '../../components/form/helper';

export const loginFormSubmit = (form: HTMLFormElement) =>
  bindForm(form, (data) => {
    console.log(data);
  });
