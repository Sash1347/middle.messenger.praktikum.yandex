export default abstract class Block<Props extends object> {
  private props: Props;
  private host: HTMLElement | null = null;

  protected constructor(props: Props) {
    this.props = props;
  }

  protected getProps(): Readonly<Props> {
    return this.props;
  }

  protected getHost(): HTMLElement {
    if (!this.host) {
      throw new Error("Component is not mounted");
    }
    return this.host;
  }

  protected isMounted(): boolean {
    return this.host !== null;
  }

  protected abstract render(): string;

  getContent(): string {
    return this.render();
  }

  mount(target: HTMLElement | string): void {
    if (this.host) {
      throw new Error("Component is already mounted");
    }

    const host =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : target;

    if (!host) {
      throw new Error(`Component host not found: ${target}`);
    }

    this.componentWillMount();
    host.innerHTML = this.getContent();
    this.host = host;
    this.componentDidMount();
  }

  setProps(nextProps: Partial<Props>): void {
    const currentProps = this.props;
    const changed = (Object.keys(nextProps) as Array<keyof Props>).some(
      (key) => !Object.is(currentProps[key], nextProps[key]),
    );

    if (!changed) {
      return;
    }

    const updatedProps = { ...currentProps, ...nextProps };
    this.componentWillUpdate(currentProps, updatedProps);
    this.props = updatedProps;

    if (this.host) {
      this.host.innerHTML = this.getContent();
    }

    this.componentDidUpdate(currentProps, updatedProps);
  }

  unmount(): void {
    if (!this.host) {
      return;
    }

    this.componentWillUnmount();
    this.host.innerHTML = "";
    this.host = null;
  }

  protected componentWillMount(): void {}
  protected componentDidMount(): void {}
  protected componentWillUpdate(
    _oldProps: Readonly<Props>,
    _newProps: Readonly<Props>,
  ): void {}
  protected componentDidUpdate(
    _oldProps: Readonly<Props>,
    _newProps: Readonly<Props>,
  ): void {}
  protected componentWillUnmount(): void {}
}
