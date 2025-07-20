import React from 'react';
import {render} from '@testing-library/react';

import {createCtx, MissingCtxProviderError} from './index.js';

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
