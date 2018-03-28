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
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const PartComp: Comp<Part> = props =>
    <Column>
        <PartTitle text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const ChapterComp: Comp<Chapter> = props =>
    <Column>
        <ChapterTitle text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const BookNodeComp: Comp<{ node: BookNode }> = props =>
    isParagraph(props.node) ? <ParagraphComp p={props.node} />
        : props.node.kind === 'chapter' ? <ChapterComp {...props.node} />
            : props.node.kind === 'part' ? <PartComp {...props.node} />
                : props.node.kind === 'subpart' ? <SubpartComp {...props.node} />
                    : assertNever(props.node);

const BookComp: Comp<Book> = props =>
    <Column>
        <BookTitle text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

export { BookComp };
