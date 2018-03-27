import * as React from 'react';
import { Comp } from './comp-utils';
import { Book, BookNode, Chapter, Part, SubPart, Paragraph } from '../model/book';
import { TextBlock, Column, Title } from './Elements';
import { assertNever } from '../utils';

const ParagraphComp: Comp<{ p: Paragraph }> = props =>
    <TextBlock text={props.p} />;

const SubpartComp: Comp<SubPart> = props =>
    <Column>
        <Title text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const PartComp: Comp<Part> = props =>
    <Column>
        <Title text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const ChapterComp: Comp<Chapter> = props =>
    <Column>
        <Title text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

const BookNodeComp: Comp<{ node: BookNode }> = props =>
    typeof props.node === 'string' ? <ParagraphComp p={props.node} />
        : props.node.kind === 'chapter' ? <ChapterComp {...props.node} />
            : props.node.kind === 'part' ? <PartComp {...props.node} />
                : props.node.kind === 'subpart' ? <SubpartComp {...props.node} />
                    : assertNever(props.node);

const BookComp: Comp<Book> = props =>
    <Column>
        <Title text={props.title} />
        {props.content.map(bn => <BookNodeComp node={bn} />)}
    </Column>;

export { BookComp };
