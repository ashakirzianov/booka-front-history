import * as React from "react";
import * as Radium from "radium";
import { Partialize, Undefined, KeyRestriction } from "../utils";

// TODO: put back key restrictions
// export type Comp<P extends KeyRestriction<P, keyof A>, A = {}> = React.SFC<P & CallbacksOpt<A>>;
export type CompProps<P, A = {}> = P & CallbacksOpt<A>;
export type Comp<P, A = {}> = React.SFC<CompProps<P, A>>;

export type Callbacks<A> = {
    [name in keyof A]: ((arg: A[name]) => void);
};

export type CallbacksOpt<A> = Partial<Callbacks<A>>;

export type Hoverable<T extends KeyRestriction<T, ":hover">> = T & { ":hover"?: Partial<T> };

type SFC<T = {}> = React.SFC<T>;

export function defaults<T>(Cmp: SFC<T>): Undefined<T> {
    return {} as any;
}

export function partial<T>(Cmp: SFC<T>) {
    return <P extends keyof T>(partials: Pick<T, P>): SFC<Partialize<T, Pick<T, P>>> => {
        return props => React.createElement(Cmp, { ...(partials as any), ...(props as any) });
    };
}

export function hoverable<T>(Cmp: SFC<T>): SFC<T> {
    return Radium(Cmp);
}
