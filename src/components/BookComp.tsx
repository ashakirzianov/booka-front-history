import * as React from 'react';
import { Comp } from './comp-utils';
import {
    Book, BookNode, Chapter, Paragraph,
    isParagraph, LoadingStub, NoBook, ActualBook, ErrorBook,
} from '../model';
import {
    TextBlock, Column, BookTitle, ChapterTitle, PartTitle, SubpartTitle,
    Route, Redirect, Switch,
} from './Elements';
import { assertNever } from '../utils';
import { connect } from './misc';

const ParagraphComp: Comp<{ p: Paragraph }> = props =>
    <TextBlock text={props.p} />;

const ChapterComp: Comp<Chapter> = props =>
    <Column>
        {
            props.level === 0 ? <ChapterTitle text={props.title} />
                : props.level > 0 ? <PartTitle text={props.title} />
                    : <SubpartTitle text={props.title} />
        }
        {buildNodes(props.content)}
    </Column>;

const BookNodeComp: Comp<{ node: BookNode, count: number }> = props =>
    isParagraph(props.node) ? <ParagraphComp p={props.node} />
        : props.node.book === 'chapter' ? <ChapterComp {...props.node} />
            : props.node.book === 'loading-stub' ? <LoadingStubComp {...props.node} />
                : assertNever(props.node, props.count.toString());

const ActualBookComp: Comp<ActualBook> = props =>
    <Column>
        <BookTitle text={props.title} />
        {buildNodes(props.content)}
    </Column>;

const BookComp: Comp<Book> = props =>
    props.book === 'loading-stub' ? <LoadingStubComp {...props} />
        : props.book === 'no-book' ? <NoBookComp {...props} />
            : props.book === 'error' ? <ErrorBookComp {...props} />
                : props.book === 'book' ? <ActualBookComp {...props} />
                    : assertNever(props);

const LoadingStubComp: Comp<LoadingStub> = props =>
    <div>Loading now...</div>;

const NoBookComp: Comp<NoBook> = props =>
    <div>No book selected</div>;

const ErrorBookComp: Comp<ErrorBook> = props =>
    <div>{props.error}</div>;

const TopComp = connect(['book'])((props) =>
    <Switch>
        <Redirect push exact from='/' to='/wap' />
        <Route path='/' render={() => <BookComp {...props.book} />} />
    </Switch>
);

function buildNodes(nodes: BookNode[]) {
    return nodes.map((bn, i) => <BookNodeComp key={i} node={bn} count={i} />);
}

export { TopComp, BookComp };
