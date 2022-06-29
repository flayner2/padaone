import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  List,
  Spinner,
} from '@chakra-ui/react';
import * as React from 'react';
import { useComboBox, useFilter } from 'react-aria';
import { useComboBoxState } from 'react-stately';
import type { AutocompleteProps } from '../lib/types';
import { ListBox } from './ListBox';
import { Popover } from './Popover';

export { Item, Section } from 'react-stately';

export function Autocomplete(props: AutocompleteProps<any>) {
  let { contains } = useFilter({ sensitivity: 'base' });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let inputRef = React.useRef(null);
  let listBoxRef = React.useRef(null);
  let popoverRef = React.useRef(null);

  const { button } = props;

  let { inputProps, listBoxProps } = useComboBox(
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
      {...props.boxProps}
    >
      <InputGroup>
        {button && <InputRightElement>{button}</InputRightElement>}
        <Input
          {...inputProps}
          {...props.inputProps}
          ref={inputRef}
          size="md"
          value={props.inputValue}
          _placeholder={props.placeholderProps}
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
                  color="protBlue.300"
                  size="sm"
                />
              </Box>
            </List>
          ) : (
            <ListBox
              {...listBoxProps}
              selectedKeys={props.selectedKeys}
              selectionMode={props.selectionMode}
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
