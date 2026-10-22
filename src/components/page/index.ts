import Block from '../block';

interface ChildComponent {
  mount(host: HTMLElement): void;
  unmount(): void;
}

export default abstract class Page extends Block<object> {
  private children: ChildComponent[] = [];

  constructor() {
    super({});
  }

  protected mountChild(child: ChildComponent, selector: string): void {
    const host = this.getHost().querySelector<HTMLElement>(selector);
    if (!host) throw new Error(`Page child host not found: ${selector}`);
    child.mount(host);
    this.children.push(child);
  }

  protected componentWillUpdate(): void {
    this.unmountChildren();
  }

  protected componentDidUpdate(): void {
    if (this.isMounted()) this.componentDidMount();
  }

  protected componentWillUnmount(): void {
    this.unmountChildren();
  }

  private unmountChildren(): void {
    this.children.forEach((child) => child.unmount());
    this.children = [];
  }
}
