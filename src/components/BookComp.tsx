import * as React from 'react';
import { Comp } from './comp-utils';
import { Book, BookNode, Chapter, Paragraph, isParagraph, LoadingStub } from '../model/book';
import { TextBlock, Column, BookTitle, ChapterTitle, PartTitle, SubpartTitle } from './Elements';
import { assertNever } from '../utils';

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
        : props.node.kind === 'chapter' ? <ChapterComp {...props.node} />
            : props.node.kind === 'loadingStub' ? <LoadingComp {...props.node} />
                : assertNever(props.node, props.count.toString());

const BookComp: Comp<Book> = props =>
    props.kind === 'loadingStub'
        ? <LoadingComp {...props} />
        : <Column>
            <BookTitle text={props.title} />
            {buildNodes(props.content)}
        </Column>;

const LoadingComp: Comp<LoadingStub> = props =>
    <div>Loading now...</div>;

function buildNodes(nodes: BookNode[]) {
    return nodes.map((bn, i) => <BookNodeComp node={bn} count={i} />);
}

export { BookComp };
