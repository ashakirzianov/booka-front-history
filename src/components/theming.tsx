import * as React from "react";
import { Comp } from "./comp-utils";

// TODO: consider converting to .ts

// TODO: remove once react officially release new context api
function createContext<V>(name: string): {
    Provider: React.SFC<{ value: V }>,
    Consumer: React.SFC<{ children?: (value: V) => React.ReactNode }>,
} {
    return (React as any).createContext(name);
}

// ------

type ThemeType = {};

const themeContext = createContext<ThemeType>("theme");

export const Themable = themeContext.Provider;

const Themed = themeContext.Consumer;
export function themed<P, A>(C: Comp<P & { theme: ThemeType }, A>): Comp<P, A> {
    return props => <Themed>{ theme => <C theme={theme} {...props} /> }</Themed>;
}
