import Handlebars from 'handlebars';

export type EventListType = Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;

export interface BlockOwnProps {
  __children?: Array<{
    component: Block<object>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

export default abstract class Block<Props extends BlockOwnProps = BlockOwnProps> {
  protected abstract template: string;

  protected props = {} as Props;

  private domElement: Element | null = null;

  protected children: Block<object>[] = [];

  protected refs: Record<string, Element> = {};

  protected events: EventListType = {};

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  private compile(): Element | null {
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement('template');

    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    this.children = this.props.__children?.map((child) => child.component) ?? [];
    this.props.__children?.forEach((child) => child.embed(fragment));

    this.refs = this.props.__refs ?? {};
    fragment.querySelectorAll('[ref]').forEach((element) => {
      const key = element.getAttribute('ref');
      if (key) this.refs[key] = element;
      element.removeAttribute('ref');
    });

    return templateElement.content.firstElementChild;
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }

  public setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props, __children: [], __refs: {} };
    this.render();
  }

  protected componentDidMount() {}

  private mountComponent() {
    this.attachListeners();
    this.componentDidMount();
  }

  protected componentWillUnmount() {}

  private unmountComponent() {
    if (this.domElement) {
      [...this.children].reverse().forEach((child) => child.unmountComponent());
      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  private attachListeners() {
    for (const [eventName, callback] of Object.entries(this.events)) {
      if (typeof callback === 'function') {
        this.domElement?.addEventListener(eventName, callback);
      }
    }
  }

  private removeListeners() {
    for (const [eventName, callback] of Object.entries(this.events)) {
      if (typeof callback === 'function') {
        this.domElement?.removeEventListener(eventName, callback);
      }
    }
  }

  public destroy() {
    this.unmountComponent();
    this.domElement?.remove();
    this.domElement = null;
    this.children = [];
    this.refs = {};
    this.props = { ...this.props, __children: [], __refs: {} };
  }

  protected render() {
    this.unmountComponent();
    const fragment = this.compile();

    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }
}
