import type {BoxProps, CSSObject, InputProps} from '@chakra-ui/react';
import type {MetadataPub} from '@prisma/client';
import {Prisma} from '@prisma/client';
import type {AriaListBoxOptions} from '@react-aria/listbox';
import type {ComboBoxProps} from '@react-types/combobox';
import type {LoadingState, Node, SelectionMode} from '@react-types/shared';
import type {ReactDatePickerProps} from 'react-datepicker';
import type {ListState} from 'react-stately';

export interface FunctionWithArguments {
  (...args: any): any;
}

export interface DebouncedFunction<F extends FunctionWithArguments> {
  (...args: Parameters<F>): Promise<ReturnType<F>>;
}

export interface DebounceReturn<F extends FunctionWithArguments> extends
    Array<DebouncedFunction<F>|(() => void)> {
  0: (...args: Parameters<F>) => Promise<ReturnType<F>>;
  1: () => void;
}

export interface AutocompleteProps<T> extends ComboBoxProps<T> {
  loadingState?: LoadingState;
  onLoadMore?: () => void;
  button?: React.ReactNode;
  placeholderProps?: CSSObject;
  boxProps?: BoxProps;
  inputProps?: InputProps;
  selectedKeys?: Iterable<React.Key>|'all'|undefined;
  selectionMode?: SelectionMode;
}

export interface ListBoxProps extends AriaListBoxOptions<unknown> {
  listBoxRef?: React.RefObject<HTMLUListElement>;
  state: ListState<unknown>;
  loadingState?: LoadingState;
  onLoadMore?: () => void;
}

export interface OptionProps {
  item: Node<unknown>;
  state: ListState<unknown>;
}

export interface PopoverProps {
  popoverRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

export type LanguagePub = string|null;

export interface Journal {
  journal: string|null;
}

export interface PaperTitlePMID {
  title: string;
  pmid: number;
}

export interface AsyncListDataDebouncedReturn<T> {
  items: T[];
  cursor: string;
}

export interface DatePickerInputProps extends InputProps {
  inputlabel?: string;
}

export interface CustomDatePickerProps extends ReactDatePickerProps {
  inputlabel?: string;
}

export interface CalendarContainerProps {
  className?: string|undefined;
  children?: React.ReactNode|undefined;
  showPopperArrow?: boolean|undefined;
  arrowProps?: {[propName: string]: any}|undefined;
}

export interface MinMaxYearPub {
  _min: {yearPub: true};
  _max: {yearPub: true};
}

export interface ClassificationRangeReturn {
  firstLayer: {min: number; max: number};
  secondLayer: {min: number; max: number};
}

export interface PaperProbabilityReturn {
  probability1stLay: number;
  probability2ndLay: number;
}

export interface FullTaxonomicData {
  taxPath: {orgLineage: string|null}|null;
  orgTaxName: string|null;
  taxID: number|null;
  accNumb: string|null;
  geneIDs: number[];
}

export interface PaperPageData {
  paper: MetadataPub|null;
  paperProbability: PaperProbabilityReturn;
  taxonomicData: FullTaxonomicData[];
}

export interface PaperTitleFormValue {
  paperTitle: string;
}

export interface PaperPMIDFormValue {
  paperPMID: string;
}

export interface PaperFiltersFormValues {
  firstLayerRange: number[];
  secondLayerRange: number[];
  taxon?: number;
  geneIDs?: string;
  filters?: {
    excludeHosts?: boolean;
    forceGeneIDs?: boolean;
    onlyCuratedPositive?: boolean;
  };
  terms?: string;
  lastAuthor?: string;
  language?: string;
  journal?: string;
  publicationDate?: {minDate?: Date; maxDate?: Date; allDates?: boolean};
  citations?: [number, number|undefined][];
}

export interface SortDescriptor {
  column?: string;
  direction?: string;
}

export interface PapersFiltersOptions {
  firstLayerRange: {min: number; max: number};
  secondLayerRange: {min: number; max: number};
  taxonID?: number;
  geneIDs?: number|string|(number|string)[];
  filters?: {
    excludeHosts?: boolean;
    forceGeneIDs?: boolean;
    onlyCuratedPositive?: boolean;
  };
  terms?: string|string[];
  lastAuthor?: string|string[];
  language?: string;
  journal?: string;
  allDates?: boolean;
  dateRange?: {min?: number; max?: number};
  citations?: number[][];
  sortDescriptor?: SortDescriptor;
}

export interface TablePaperInfo {
  pmid: number;
  title: string;
  yearPub?: number|null;
  lastAuthor?: string|null;
  citations?: number|null;
  classification1stLay?: {probability: Prisma.Decimal}|null;
  classification2ndLay?: {probability: Prisma.Decimal}|null;
  taxNames?: string[];
}

export interface TablePaperInfoRawQueryPre {
  pmid: number;
  title: string;
  yearPub?: number|null;
  lastAuthor?: string|null;
  citations?: number|null;
  probability1stLay?: Prisma.Decimal|null;
  probability2ndLay?: Prisma.Decimal|null;
  taxNames?: string;
}

export interface TablePaperInfoRawQuery extends
    Omit<TablePaperInfoRawQueryPre, 'taxNames'> {
  taxNames?: string[];
}

export interface ColumnName {
  name: string;
  key: string;
}
