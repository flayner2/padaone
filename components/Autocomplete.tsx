import {
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  List,
  Spinner,
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
            <List
              overflow="auto"
              maxHeight="300"
              my="1"
              display="flex"
              flexDirection="column"
            >
              <Box
                pt="4"
                pb="2"
                display="flex"
                justifyContent="center"
              >
                <Spinner
                  color="blue.400"
                  size="sm"
                />
              </Box>
            </List>
          ) : (
            <ListBox
              {...listBoxProps}
              listBoxRef={listBoxRef}
              state={state}
              loadingState={props.loadingState}
              onLoadMore={props.onLoadMore}
            />
          )}
        </Popover>
      )}
    </Box>
  );
}
