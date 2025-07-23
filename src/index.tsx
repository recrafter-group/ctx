import React from 'react';

/**
 * Interface that defines the properties for the context component.
 *
 * @typeParam Value - The type of value that the context will provide.
 *
 * @public
 */
export interface CtxProps<Value> {
    /**
     * Children can be either a render function that receives the context value
     * or standard React children nodes.
     */
    children?: ((value: Value) => React.ReactNode) | React.ReactNode;
}

/**
 * Interface that defines a context component with associated properties and methods.
 *
 * @typeParam Value - The type of value that the context will provide.
 * @typeParam Props - Additional properties that can be passed to the context provider (defaults to an empty object).
 *
 * @public
 */
export interface CtxComponent<Value, Props = {}> {
    /**
     * Component function that renders the context provider.
     *
     * @param props - The component props
     * @returns React element or null
     */
    (props: Omit<Props, 'children'> & CtxProps<Value>): React.ReactElement<any, any> | null;

    /**
     * Display name for debugging purposes.
     */
    displayName: string;

    /**
     * Hook function to access the context value.
     *
     * @throws {@link MissingCtxProviderError}
     * Throws an error if the context provider is not found in the component tree.
     * @returns The context value
     */
    use: UseCtx<Value>;
}

/**
 * Type for context hook functions that return a context value.
 *
 * @typeParam Value - The type of value that the context will provide.
 * @returns The context value
 *
 * @public
 */
export type UseCtx<Value> = () => Value;

/**
 * Type for hook functions that use props to create a context value.
 *
 * @typeParam Value - The type of value that the context will provide.
 * @typeParam Props - Type of properties passed to the hook function.
 * @param props - Properties used to create the context value.
 * @returns The context value derived from props.
 *
 * @public
 */
export type UseValue<Value, Props> = (props: Props) => Value;

/**
 * Type for the factory function that creates context components.
 *
 * @typeParam Value - The type of value that the context will provide.
 * @typeParam Props - Type of properties that can be passed to the context provider.
 * @param useValue - Hook function that creates the context value from props.
 * @param displayName - Optional name for the context, used for debugging purposes.
 * @returns A context component with the use() method for accessing context values.
 *
 * @public
 */
export type CreateCtx = <Value, Props>(
    useValue: UseValue<Value, Props>,
    displayName?: string,
) => CtxComponent<Value, Props>;

/**
 * Error thrown when trying to use a context without a provider in the component tree.
 *
 * @public
 */
export class MissingCtxProviderError extends Error {
    constructor(displayName: string) {
        super(`Context provider is missing. Please mount ${displayName} component above in the component tree.`);
    }
}

const MISSING_CTX_PROVIDER_SYMBOL = Symbol('No context provider');

/**
 * Factory function that creates a context component with associated helper methods.
 *
 * This function simplifies the React Context API by creating a component that:
 * - Automatically provides a context value using the given hook
 * - Supports both regular children and render functions
 * - Includes a use() method for consuming the context
 *
 * @example
 * ```tsx
 * // Create a context for a string value
 * const Ctx = createCtx(() => React.useState(''));
 *
 * // Use the context in components
 * const TextInput = () => {
 *   const [value, setValue] = Ctx.use();
 *   return <input value={value} onChange={(e) => setValue(e.target.value)} />;
 * };
 *
 * // Wrap components with the context provider
 * const App = () => (
 *   <Ctx>
 *     <TextInput />
 *   </Ctx>
 * );
 * ```
 *
 * @typeParam Value - The type of value that the context will provide.
 * @typeParam Props - Type of properties that can be passed to the context provider.
 * @param useValue - Hook function that creates the context value from props passed to the context provider.
 * @param displayName - Optional name for the context, used for debugging and error messages.
 * @returns A context component
 *
 * @public
 */
export const createCtx: CreateCtx = (useValue, displayName) => {
    const Context = React.createContext<any>(MISSING_CTX_PROVIDER_SYMBOL);
    const Ctx: CtxComponent<any, any> = (props) => {
        const value = useValue(props);
        return (
            <Context.Provider value={value}>
                {typeof props.children === 'function' ? props.children(value) : props.children}
            </Context.Provider>
        );
    };
    Ctx.displayName = displayName ? `Ctx(${displayName})` : 'Ctx';
    Ctx.use = () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const value = React.useContext(Context);
        if (value === MISSING_CTX_PROVIDER_SYMBOL) {
            throw new MissingCtxProviderError(Ctx.displayName);
        }
        return value;
    };
    return Ctx;
};
