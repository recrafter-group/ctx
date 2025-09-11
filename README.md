# @recrafter/ctx

_A simple wrapper around
[React.createContext](https://react.dev/reference/react/createContext) that
makes it easy to use hooks and context together. It reduces boilerplate and
improves type safety, providing a clean and developer-friendly API._

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Example](#basic-example)
    - [Using Render Functions](#using-render-functions)
    - [Passing Props to Context](#passing-props-to-context)
    - [Missing Provider Error Prevention](#missing-provider-error-prevention)
    - [Using injections](#using-injections)
        - [Direct injection](#direct-injection)
        - [Mapped injection](#mapped-injection)
- [API](#api)
    - [createCtx(useValue, displayName?)](#createctxusevalue-displayname)
    - [CtxComponent](#ctxcomponent)
- [Development](#development)

## Features

- 🔄 Simple hook-based context creation with minimal boilerplate
- 🛡️ Strict, automatic type inference out of the box
- 🧩 Render function support inside the provider for direct context access
- ⚙️ Easy binding of context props with the value hook
- 🚫 No need for `useContext(Context)` or `Context.Consumer` — cleaner API

## Requirements

- React ≥ 16.8
- TypeScript (optional, but recommended)

## Installation

```bash
npm i react @recrafter/ctx
```

## Usage

### Basic Example

```tsx
import React from 'react';
import {createCtx} from '@recrafter/ctx';

// Define a hook with your value:
const useValue = () => React.useState('');
// Context factory takes any hook as the first argument:
const Ctx = createCtx(useValue);

// Now you can use Ctx.use() to get context value:

const Input = () => {
    const [value, setValue] = Ctx.use();
    return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};

const ResetButton = () => {
    const [, setValue] = Ctx.use();
    return <button onClick={() => setValue('')}>Reset</button>;
};

// Put Ctx component above in the component tree.
// The Ctx component is the place where the hook is executed.
const App = () => (
    <Ctx>
        <Input />
        <ResetButton />
    </Ctx>
);
```

### Using Render Functions

You can also use a render function to get the context value:

```tsx
const App = () => (
    <Ctx>
        {([value, setValue]) => (
            <>
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <button onClick={() => setValue('')}>Reset</button>
            </>
        )}
    </Ctx>
);
```

### Passing Props to Context

You can pass properties to the context component:

```tsx
interface CtxProps {
    initialValue: string;
}

const Ctx = createCtx((props: CtxProps) => {
    return React.useState(props.initialValue);
});

const App = () => (
    <Ctx initialValue="Hello, world!">
        <Input />
        <ResetButton />
    </Ctx>
);
```

### Missing Provider Error Prevention

Unlike native [useContext](https://react.dev/reference/react/useContext), this
library prevents using `Ctx.use()` without declaring the Ctx component higher in
the component tree. If you try to do this:

```tsx
const Ctx = createCtx(() => React.useState(''), 'inputValue');

const Input = () => {
    const [value, setValue] = Ctx.use();
    return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};

// MissingCtxProviderError: no provider in the component tree
const App = () => <Input />;
```

You'll get a clear error message:

> Context provider is missing. Please mount Ctx(inputValue) component above in
> the component tree.

### Using injections

The `Ctx.inject()` - HOC provides an alternative way to consume context values
by injecting them directly into component props.

#### Direct injection

```tsx
const useValue = () => {
    const [value, setValue] = React.useState('');
    return {value, setValue};
};
const Ctx = createCtx(useValue);

type InputProps = {
    value: string;
    setValue: (value: string) => void;
    type: 'password' | 'text';
};

const Input = ({type, value, setValue}: InputProps) => (
    <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
);

type ResetButtonProps = {setValue: (value: string) => void};

const ResetButton = ({setValue}: ResetButtonProps) => (
    <button onClick={() => setValue('')}>Reset</button>
);

// Inject context values directly into component props
const InjectedInput = Ctx.inject(Input);
const InjectedResetButton = Ctx.inject(ResetButton);

const App = () => (
    <Ctx>
        <InjectedInput type="text" />
        <InjectedResetButton />
    </Ctx>
);
```

#### Mapped injection

You can also use a mapper function to transform context values. The function can
be a regular function or a React hook:

```tsx
const useValue = () => React.useState('');
const Ctx = createCtx(useValue);

type InputProps = {
    value: string;
    setValue: (value: string) => void;
    type: 'password' | 'text';
};

const Input = ({type, value, setValue}: InputProps) => (
    <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
);

type ExtraProps = {wrapper: string};

const InjectedInput = Ctx.inject(
    ([value, setValue], {wrapper}: ExtraProps) => ({
        value: `${wrapper}${value}${wrapper}`,
        setValue,
    }),
    Input,
);

const App = () => (
    <Ctx>
        <InjectedInput type="text" wrapper="--" />
    </Ctx>
);
```

## API

### `createCtx(useValue, displayName?)`

Function to create a context.

**Parameters:**

- `useValue`: Hook that returns the context value
- `displayName?`: Optional name for debugging

**Returns:**

- `CtxComponent`: Context component with `use()` and `inject()` methods

### `CtxComponent`

**Props:**

- `children`: React elements or a render function `(value) => ReactNode`
- Any additional props that are passed to the `useValue` hook

**Methods:**

- `use(): Value`: Hook to get the context value
- `inject(Component): InjectedComponent`: Inject context value directly into
  component props
- `inject(useMappedValue, Component): InjectedComponent`: Inject transformed
  context value using a mapper function, that can be a regular function or a
  React hook

## Development

```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build the project
npm run build

# Check code format
npm run formatter:check
npm run formatter:fix

# Analyze code quality
npm run analyzer:code:check
npm run analyzer:code:fix

# Analyze public API quality
npm run analyzer:api:check
```
