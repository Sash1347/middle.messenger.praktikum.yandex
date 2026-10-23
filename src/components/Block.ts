import type { TemplateDelegate } from 'handlebars';

export default abstract class Block<Props extends object = Record<string, never>> {
  protected props: Props;
  private readonly template: TemplateDelegate;

  constructor(props: Props, template: TemplateDelegate) {
    this.props = { ...props };
    this.template = template;
  }

  public setProps(props: Partial<Props>): void {
    this.props = { ...this.props, ...props };
  }

  protected getTemplateData(): object {
    return this.props;
  }

  public render(): string {
    return this.template(this.getTemplateData());
  }
}
