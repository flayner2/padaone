import type {InputProps} from '@chakra-ui/react';
import type {MetadataPub} from '@prisma/client';
import type {ReactDatePickerProps} from 'react-datepicker';

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

export type LanguagePub = string|null;

export interface Journal {
  journal: string|null;
}

export interface PaperTitlePMID {
  title: string;
  pmid: number;
}

export interface TaxonNameAndID {
  orgTaxName: string|null;
  taxID: number|null;
}

export interface AsyncListDataDebouncedReturn<T> {
  items: T[];
  cursor: string;
}

export interface DatePickerInputProps extends InputProps {
  inputLabel?: string;
}

export interface CustomDatePickerProps extends ReactDatePickerProps {
  inputLabel?: string;
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
  filters?: {excludeHosts?: boolean; forceGeneIDs?: boolean};
  terms?: string;
  lastAuthor?: string;
  language?: string;
  journal?: string;
  publicationDate?: number[];
  citations?: string|string[];
}
