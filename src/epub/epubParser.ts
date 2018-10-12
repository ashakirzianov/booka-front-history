import epubParser from '@gxl/epub-parser';
import { PromiseType } from '../utils';

export type Epub = PromiseType<ReturnType<typeof epubParser>>;
export type Section = Epub['sections'][0];
export { epubParser };
