import Block, { type BlockOwnProps } from "../components/Block";

export type RenderContent = (content: string | Element) => void;

interface PageProps extends BlockOwnProps {
  [key: string]: unknown;
}

class Page extends Block<PageProps> {
  protected template: string;

  constructor(template: string, props: PageProps) {
    super(props);
    this.template = template;
  }
}

export function renderPage(
  template: string,
  props: PageProps,
  renderContent: RenderContent,
): () => void {
  const page = new Page(template, props);
  const element = page.element();
  if (!element) throw new Error("Page root not found");
  renderContent(element);
  return () => page.destroy();
}
