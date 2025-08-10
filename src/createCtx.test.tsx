import React from 'react';
import {render} from '@testing-library/react';

import {createCtx, MissingCtxProviderError} from './createCtx.js';

const useValue = () => 'Hello!';
const createChild = (Ctx: {use(): string}) => {
    return function Child() {
        return <div>{Ctx.use()}</div>;
    };
};
const renderChild = (ctxValue: string) => <div>{ctxValue}</div>;
const expectToMatchSnapshot = (element: {innerHTML: string}) => expect(element.innerHTML).toMatchSnapshot();

test('Default', () => {
    const Ctx = createCtx(useValue);
    const {container} = render(<Ctx />);
    expectToMatchSnapshot(container);
});

test('Should render children', () => {
    const Ctx = createCtx(useValue);
    const {container} = render(
        <Ctx>
            <div />
        </Ctx>,
    );
    expectToMatchSnapshot(container);
});

test('Should render children with context value', () => {
    const Ctx = createCtx(useValue);
    const Child = createChild(Ctx);
    const {container} = render(
        <Ctx>
            <Child />
        </Ctx>,
    );
    expectToMatchSnapshot(container);
});

test('Should render a child using render function', () => {
    const Ctx = createCtx(useValue);
    const {container} = render(<Ctx>{renderChild}</Ctx>);
    expectToMatchSnapshot(container);
});

describe('Should render children using context value based on props', () => {
    const useValue = (ctxProps: {name: string}) => `Hello, ${ctxProps.name}!`;

    test('Should render children with context value', () => {
        const Ctx = createCtx(useValue);
        const Child = createChild(Ctx);
        const {container, rerender} = render(
            <Ctx name="Anonymous">
                <Child />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
        rerender(
            <Ctx name="Mike">
                <Child />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should render a child using render function', () => {
        const Ctx = createCtx(useValue);
        const {container, rerender} = render(<Ctx name="Anonymous">{renderChild}</Ctx>);
        expectToMatchSnapshot(container);
        rerender(<Ctx name="Mike">{renderChild}</Ctx>);
        expectToMatchSnapshot(container);
    });
});

describe('Should not render children without Provider above', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
    });

    test('Should display error without context name', () => {
        const Ctx = createCtx(useValue);
        const Child = createChild(Ctx);
        const matcher = expect(() => render(<Child />));
        matcher.toThrow(MissingCtxProviderError);
        matcher.toThrow('Context provider is missing. Please mount Ctx component above in the component tree.');
    });

    test('Should display error with context name', () => {
        const Ctx = createCtx(useValue, 'ContextName');
        const Child = createChild(Ctx);
        const matcher = expect(() => render(<Child />));
        matcher.toThrow(MissingCtxProviderError);
        matcher.toThrow(
            'Context provider is missing. Please mount Ctx(ContextName) component above in the component tree.',
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});

describe('Ctx.inject', () => {
    type ChildProps = {message: string};
    const Child = ({message}: ChildProps) => <div>{message}</div>;
    const useValue = () => ({message: 'Hello!'});

    test('Should inject context value into component props', () => {
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should accept literal type as subtype of string without TypeScript errors', () => {
        const useValue = () => ({message: 'Hello!' as const});
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should not cause TypeScript errors when context has extra properties not required by component', () => {
        const useValue = () => ({text: 'Hello!', message: 'Hello!'});
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should inject context value with type mismatch (expect TypeScript error)', () => {
        // Incompatible types. Expected 'string' to be 'number'.
        const useValue = () => ({message: 1});
        const Ctx = createCtx(useValue);
        // @ts-expect-error
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should inject context value using mapper with type mismatch (expect TypeScript error)', () => {
        // Incompatible types. Expected 'string' to be 'number'.
        const useValue = () => ({message: 1});
        const Ctx = createCtx(useValue);
        // @ts-expect-error
        const BoundChild = Ctx.inject(({message}: {message: number}) => ({message}), Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should inject context value with optional props and default fallback', () => {
        type ChildProps = {defaultMessage: string; message?: string};
        const Child = ({defaultMessage, message}: ChildProps) => <div>{message ?? defaultMessage}</div>;
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild defaultMessage="Hi!" />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should inject context value while preserving existing props', () => {
        type ChildProps = {message: string; name: string};
        const Child = ({message, name}: ChildProps) => <div>{`${message}, ${name}!`}</div>;
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(Child);
        const {container} = render(
            <Ctx>
                <BoundChild name="Mike" />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });

    test('Should inject transformed context value using mapper function', () => {
        type ChildProps = {message: string; name: string};
        const Child = ({message, name}: ChildProps) => <div>{`${message}, ${name}!`}</div>;
        const useValue = () => ({text: 'Hello', message: 1});
        const Ctx = createCtx(useValue);
        const BoundChild = Ctx.inject(({text}) => ({message: text, name: 'Mike'}), Child);
        const {container} = render(
            <Ctx>
                <BoundChild />
            </Ctx>,
        );
        expectToMatchSnapshot(container);
    });
});
