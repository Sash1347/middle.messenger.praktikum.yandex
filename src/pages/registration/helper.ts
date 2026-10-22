import { bindForm } from '../../components/form/helper';

export const registrationFormSubmit = (form: HTMLFormElement) =>
  bindForm(form, (data) => {
    console.log(data);
  });
