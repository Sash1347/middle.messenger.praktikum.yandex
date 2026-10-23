import { bindForm } from '../../components/form/helper';

export const changePasswordFormSubmit = (form: HTMLFormElement) =>
  bindForm(form, (data) => {
    console.log(data);
  });
