import Handlebars, { type HelperOptions } from "handlebars";
import Block, { type BlockOwnProps } from "./Block";

let uniqueId = 0;

export function registerComponent<Props extends BlockOwnProps>(Component: {
  componentName: string;
  new (props: Props): Block<Props>;
}): void {
  if (Object.hasOwn(Handlebars.helpers, Component.componentName)) {
    throw new Error(`Component already registered: ${Component.componentName}`);
  }

  Handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
      const component = new Component(hash as Props);
      const root: BlockOwnProps = data.root;

      if (typeof hash.ref === "string") {
        const element = component.element();
        if (!element)
          throw new Error(
            `Component root not found: ${Component.componentName}`,
          );
        (root.__refs ??= {})[hash.ref] = element;
      }

      (root.__children ??= []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            throw new Error(
              `Placeholder not found for component: ${Component.componentName}`,
            );
          }
          const element = component.element();
          if (!element)
            throw new Error(
              `Component root not found: ${Component.componentName}`,
            );
          placeholder.replaceWith(element);
        },
      });

      return `<div ${dataAttribute}></div>`;
    },
  );
}
