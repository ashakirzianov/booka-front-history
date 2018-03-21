import * as React from "react";
import {
    DragSourceConnector, DragSourceMonitor, DragSource, ConnectDragSource,
    DragDropContext, DropTargetConnector, DropTargetMonitor, ConnectDropTarget, DropTarget,
} from "react-dnd";
import { def, mapObject, ValueConstraint } from "../utils";
import MultiBackend from "react-dnd-multi-backend";
// tslint:disable-next-line:no-submodule-imports
import HTML5toTouch from "react-dnd-multi-backend/lib/HTML5toTouch";
import TouchBackend from "react-dnd-touch-backend";
import { Key } from "readline";
import HTML5Backend from "react-dnd-html5-backend";

type SFC<T> = React.SFC<T>;

export type Constraint<T> = ValueConstraint<T, {
    sourceIn: {},
    sourceOut: {},
    targetIn: {},
    targetOut: {},
}>;

export type Connector<Props> = <AllProps extends Props>(Comp: SFC<AllProps>) => SFC<AllProps>; // TODO: add key restriction?
export type ConnectorsPair<SProps, TProps> = {
    source: Connector<SProps>,
    target: Connector<TProps>,
};
export type Connectors<Template extends Constraint<Template>> = {
    [T in keyof Template]: ConnectorsPair<Template[T]["sourceIn"], Template[T]["targetIn"]>;
};

export type SourceSpec<SourceProps, SourceRet> = {
    beginDrag: (props: SourceProps, monitor: DragSourceMonitor) => SourceRet,
};

export type TargetSpec<TargetProps, TargetRet> = {
    drop: (props: TargetProps, monitor: DropTargetMonitor) => TargetRet,
};

export type Spec<SourceProps, SourceRet, TargetProps, TargetRet> = {}
    & SourceSpec<SourceProps, SourceRet>
    & TargetSpec<TargetProps, TargetRet>
    ;

export type Specs<T extends Constraint<T>> = T;

export function spec<
    SourceProps, SourceRet,
    TargetProps, TargetRet
>(allSpecs: Spec<SourceProps, SourceRet, TargetProps, TargetRet>) {
    return {
        ...allSpecs,
        sourceIn: def<SourceProps>(),
        sourceOut: def<SourceRet>(),
        targetIn: def<TargetProps>(),
        targetOut: def<TargetRet>(),
    };
}

function buildConnectorsPair<
    T extends string,
    SP, SR, TP, TR, S extends Spec<SP, SR, TP, TR>
>(key: T, dndSpec: S): ConnectorsPair<SP, TP> {
    function dragCollect(connect: DragSourceConnector) {
        return {
            connectDragSource: connect.dragSource(),
        };
    }

    function dropCollect(connect: DropTargetConnector) {
        return {
            connectDropTarget: connect.dropTarget(),
        };
    }

    const wrappedSource = {
        beginDrag: (wp: { props: SP }, monitor: DragSourceMonitor) =>
            dndSpec.beginDrag(wp.props, monitor),
    };

    const wrappedTarget = {
        drop: (wp: { props: TP }, monitor: DropTargetMonitor) => dndSpec.drop(wp.props, monitor),
    };

    function sourceConnector<P extends SP>(Comp: SFC<P>): SFC<P> {
        const wrapped: SFC<{
            props: P,
            connectDragSource: ConnectDragSource,
        }> = wrappedProps => wrappedProps.connectDragSource(
            React.createElement("div", {},
                React.createElement(Comp, wrappedProps.props, wrappedProps.children)
            )
        );

        const dragSourceComp = DragSource<{
            props: P,
            connectDragSource: ConnectDragSource,
        }>(key, wrappedSource, dragCollect)(wrapped);
        const connectedComp: SFC<P> = props => React.createElement(
            dragSourceComp,
            { props: props, connectDragSource: undefined as any },
            props.children);

        return connectedComp;
    }

    function targetConnector<P extends TP>(Comp: SFC<P>): SFC<P> {
        const wrapped: SFC<{
            props: P,
            connectDropTarget: ConnectDropTarget,
        }> = wrappedProps => wrappedProps.connectDropTarget(
            React.createElement("div", {}, // TODO: do we need to wrap?
                React.createElement(Comp, wrappedProps.props, wrappedProps.children)
            )
        );

        const dropTargetComp = DropTarget<{
            props: P,
            connectDropTarget: ConnectDropTarget,
        }>(key, wrappedTarget, dropCollect)(wrapped);
        const connectedComp: SFC<P> = props => React.createElement(
            dropTargetComp,
            { props: props, connectDropTarget: undefined as any },
            props.children);

        return connectedComp;
    }

    return {
        source: sourceConnector,
        target: targetConnector,
    };
}

export function buildConnectors<T extends Constraint<T>>(s: Specs<T>): Connectors<T> {
    return mapObject(s, buildConnectorsPair as any);
}

export function connectDnd<P>(Comp: React.ComponentClass<P>) {
    // return DragDropContext(MultiBackend(HTML5toTouch))(Comp);
    // return DragDropContext(TouchBackend({ enableMouseEvents: true }))(Comp);
    return DragDropContext(HTML5Backend)(Comp);
}
