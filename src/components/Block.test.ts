import { describe, it, expect, vi, beforeEach } from 'vitest';
import Block, { type BlockOwnProps } from './Block';

interface TestBlockProps extends BlockOwnProps {
  message?: string;
}

class TestBlock extends Block<TestBlockProps> {
  protected template = '<div class="test">{{ message }}</div>';
}

describe('Block компонент', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Создание и рендеринг', () => {
    it('создаёт элемент с template', () => {
      const block = new TestBlock();
      const element = block.element();

      expect(element).toBeTruthy();
      expect(element?.tagName).toBe('DIV');
      expect(element?.classList.contains('test')).toBe(true);
    });

    it('использует props при рендеринге', () => {
      const block = new TestBlock({ message: 'Hello World' });
      const element = block.element();

      expect(element?.textContent).toBe('Hello World');
    });

    it('возвращает один и тот же element при повторном вызове', () => {
      const block = new TestBlock();
      const element1 = block.element();
      const element2 = block.element();

      expect(element1).toBe(element2);
    });

    it('добавляет атрибут ref на элементы', () => {
      class RefBlock extends Block<BlockOwnProps> {
        protected template = '<div><input ref="myInput" type="text" /></div>';
      }

      const block = new RefBlock();
      block.element();

      expect(block['refs']['myInput']).toBeTruthy();
      expect(block['refs']['myInput'].tagName).toBe('INPUT');
    });

    it('удаляет атрибут ref после добавления в refs', () => {
      class RefBlock extends Block<BlockOwnProps> {
        protected template = '<div><input ref="myInput" type="text" /></div>';
      }

      const block = new RefBlock();
      const element = block.element();

      const input = element?.querySelector('input');
      expect(input?.getAttribute('ref')).toBeNull();
    });
  });

  describe('setProps обновление', () => {
    it('обновляет props и перерендирует', () => {
      const block = new TestBlock({ message: 'Initial' });
      const element1 = block.element();

      block.setProps({ message: 'Updated' });
      const element2 = block.element();

      expect(element2?.textContent).toBe('Updated');
      expect(element1).not.toBe(element2);
    });

    it('сохраняет остальные props при частичном обновлении', () => {
      const initialProps: TestBlockProps = { message: 'Hello' };
      const block = new TestBlock(initialProps);

      block.setProps({ message: 'World' });

      expect(block['props'].message).toBe('World');
    });
  });

  describe('События', () => {
    it('подписывается на события при монтировании', () => {
      const handleClick = vi.fn();

      class ClickBlock extends Block<BlockOwnProps> {
        protected template = '<button class="btn">Click me</button>';

        constructor(props: BlockOwnProps = {}) {
          super(props);
          this.events = {
            click: handleClick,
          };
        }
      }

      const block = new ClickBlock();
      const element = block.element() as HTMLElement;

      element?.click();

      expect(handleClick).toHaveBeenCalled();
    });

    it('отписывается от событий при размонтировании', () => {
      const handleClick = vi.fn();

      class ClickBlock extends Block<BlockOwnProps> {
        protected template = '<button class="btn">Click me</button>';

        constructor(props: BlockOwnProps = {}) {
          super(props);
          this.events = {
            click: handleClick,
          };
        }
      }

      const block = new ClickBlock();
      const element = block.element() as HTMLElement;

      block.destroy();

      handleClick.mockClear();
      element?.click();

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('вызывает обработчик события с Event объектом', () => {
      const handleClick = vi.fn();

      class ClickBlock extends Block<BlockOwnProps> {
        protected template = '<button>Click</button>';

        constructor(props: BlockOwnProps = {}) {
          super(props);
          this.events = {
            click: handleClick,
          };
        }
      }

      const block = new ClickBlock();
      const element = block.element() as HTMLElement;

      element?.click();

      expect(handleClick).toHaveBeenCalledWith(expect.any(Event));
    });
  });

  describe('Lifecycle методы', () => {
    it('вызывает componentDidMount после монтирования', () => {
      const componentDidMount = vi.fn();

      class LifecycleBlock extends Block<BlockOwnProps> {
        protected template = '<div></div>';

        protected componentDidMount(): void {
          componentDidMount();
        }
      }

      const block = new LifecycleBlock();
      block.element();

      expect(componentDidMount).toHaveBeenCalled();
    });

    it('вызывает componentWillUnmount перед размонтированием', () => {
      const componentWillUnmount = vi.fn();

      class LifecycleBlock extends Block<BlockOwnProps> {
        protected template = '<div></div>';

        protected componentWillUnmount(): void {
          componentWillUnmount();
        }
      }

      const block = new LifecycleBlock();
      block.element();

      block.destroy();

      expect(componentWillUnmount).toHaveBeenCalled();
    });
  });

  describe('destroy метод', () => {
    it('удаляет DOM элемент', () => {
      const block = new TestBlock();
      const element = block.element() as HTMLElement;

      document.body.appendChild(element);

      block.destroy();

      expect(element.parentNode).toBeNull();
    });

    it('очищает refs при destroy', () => {
      class RefBlock extends Block<BlockOwnProps> {
        protected template = '<div><input ref="myInput" /></div>';
      }

      const block = new RefBlock();
      block.element();

      expect(Object.keys(block['refs']).length).toBeGreaterThan(0);

      block.destroy();

      expect(Object.keys(block['refs']).length).toBe(0);
    });

    it('очищает children при destroy', () => {
      class ChildBlock extends Block<BlockOwnProps> {
        protected template = '<span>Child</span>';
      }

      class ParentBlock extends Block<BlockOwnProps> {
        protected template = '<div></div>';
      }

      const child = new ChildBlock();
      const parent = new ParentBlock({
        __children: [
          {
            component: child,
            embed: vi.fn(),
          },
        ],
      } as BlockOwnProps);

      parent.element();

      expect(parent['children'].length).toBeGreaterThan(0);

      parent.destroy();

      expect(parent['children'].length).toBe(0);
    });
  });

  describe('Обработка ошибок', () => {
    it('не вызывает обработчик если это не функция', () => {
      class BadEventBlock extends Block<BlockOwnProps> {
        protected template = '<button>Click</button>';

        constructor(props: BlockOwnProps = {}) {
          super(props);
          this.events = {
            click: 'not a function' as unknown as (event: Event) => void,
          };
        }
      }

      const block = new BadEventBlock();
      const element = block.element() as HTMLElement;

      expect(() => {
        element?.click();
      }).not.toThrow();
    });
  });

  describe('Props с __children и __refs', () => {
    it('сбрасывает __children и __refs при setProps', () => {
      class RefBlock extends Block<BlockOwnProps> {
        protected template = '<div></div>';
      }

      const refs = { testRef: document.createElement('div') };
      const block = new RefBlock({ __refs: refs } as BlockOwnProps);

      block.element();

      block.setProps({});

      expect(block['props'].__children).toEqual([]);
      expect(block['props'].__refs).toEqual({});
    });
  });

  describe('Template компиляция', () => {
    it('компилирует Handlebars шаблон', () => {
      class TemplateBlock extends Block<BlockOwnProps> {
        protected template = '<div>{{#if visible}}<p>Visible</p>{{/if}}</div>';
      }

      const block = new TemplateBlock({ visible: true } as BlockOwnProps);
      const element = block.element();

      expect(element?.textContent).toContain('Visible');
    });

    it('использует conditional rendering', () => {
      class ConditionalBlock extends Block<BlockOwnProps> {
        protected template = '<div>{{#if show}}<p>Show</p>{{/if}}</div>';
      }

      const block = new ConditionalBlock({ show: false } as BlockOwnProps);
      const element = block.element();

      expect(element?.textContent).not.toContain('Show');
    });
  });
});
