import * as React from 'react';
import { Comp } from './comp-utils';
import { Book, BookNode, Chapter, Part, Subpart, Paragraph, isParagraph } from '../model/book';
import { TextBlock, Column, BookTitle, ChapterTitle, PartTitle, SubpartTitle } from './Elements';
import { assertNever } from '../utils';

const ParagraphComp: Comp<{ p: Paragraph }> = props =>
    <TextBlock text={props.p} />;

const SubpartComp: Comp<Subpart> = props =>
    <Column>
        <SubpartTitle text={props.title} />
        {buildNodes(props.content)}
    </Column>;

const PartComp: Comp<Part> = props =>
    <Column>
        <PartTitle text={props.title} />
        {buildNodes(props.content)}
    </Column>;

const ChapterComp: Comp<Chapter> = props =>
    <Column>
        <ChapterTitle text={props.title} />
        {buildNodes(props.content)}
    </Column>;

const BookNodeComp: Comp<{ node: BookNode, count: number }> = props =>
    isParagraph(props.node) ? <ParagraphComp p={props.node} />
        : props.node.kind === 'chapter' ? <ChapterComp {...props.node} />
            : props.node.kind === 'part' ? <PartComp {...props.node} />
                : props.node.kind === 'subpart' ? <SubpartComp {...props.node} />
                    : assertNever(props.node, props.count.toString());

const BookComp: Comp<Book> = props =>
    <Column>
        <BookTitle text={props.title} />
        {buildNodes(props.content)}
    </Column>;

function buildNodes(nodes: BookNode[]) {
    return nodes.map((bn, i) => <BookNodeComp node={bn} count={i}/>);
}

export { BookComp };
