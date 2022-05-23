//import type {ThemingProps} from '@chakra-ui/react';
import {
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
} from '@chakra-ui/react';
import type { ComboBoxProps } from '@react-types/combobox';
import type { LoadingState } from '@react-types/shared';
import * as React from 'react';
import { useComboBox, useFilter } from 'react-aria';
import { useComboBoxState } from 'react-stately';
import { ListBox } from './ListBox';
import { Popover } from './Popover';

export { Item, Section } from 'react-stately';

interface AutocompleteProps<T> extends ComboBoxProps<T> {
  loadingState?: LoadingState;
  onLoadMore?: () => void;
  button?: React.ReactNode;
  placeholder?: string;
  //inputSize?: ThemingProps<"Input">
}

export function Autocomplete<T extends object>(props: AutocompleteProps<T>) {
  let { contains } = useFilter({ sensitivity: 'base' });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let inputRef = React.useRef(null);
  let listBoxRef = React.useRef(null);
  let popoverRef = React.useRef(null);

  const { button } = props;

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  return (
    <Box
      display="inline-block"
      position="relative"
    >
      <FormLabel {...labelProps}>{props.label}</FormLabel>
      <InputGroup>
        {button && <InputRightElement>{button}</InputRightElement>}
        <Input
          {...inputProps}
          ref={inputRef}
          size="md"
          placeholder={props.placeholder}
        />
      </InputGroup>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          isOpen={state.isOpen}
          onClose={state.close}
        >
          {props.loadingState === 'loading' ||
          props.loadingState === 'filtering' ? (
            <Spinner
              color="blue.400"
              size="sm"
            />
          ) : state.collection.size ? (
            <ListBox
              {...listBoxProps}
              listBoxRef={listBoxRef}
              state={state}
              loadingState={props.loadingState}
              onLoadMore={props.onLoadMore}
            />
          ) : (
            <Text>Term not found</Text>
          )}
        </Popover>
      )}
    </Box>
  );
}
