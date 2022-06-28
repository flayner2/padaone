import { CheckIcon } from '@chakra-ui/icons';
import { Box, List, ListItem, Spinner } from '@chakra-ui/react';
import * as React from 'react';
import { useListBox, useOption } from 'react-aria';
import type { ListBoxProps, OptionProps } from '../lib/types';

export function ListBox(props: ListBoxProps) {
  let ref = React.useRef<HTMLUListElement>(null);
  let { listBoxRef = ref, state } = props;

  let { listBoxProps } = useListBox(props, state, listBoxRef);

  let onScroll = (e: React.UIEvent) => {
    let scrollOffset =
      e.currentTarget.scrollHeight - e.currentTarget.clientHeight * 2;
    if (e.currentTarget.scrollTop > scrollOffset && props.onLoadMore) {
      props.onLoadMore();
    }
  };

  return (
    <List
      {...listBoxProps}
      ref={listBoxRef}
      overflow="auto"
      maxHeight="300"
      my="1"
      display="flex"
      flexDirection="column"
      onScroll={onScroll}
    >
      {[...state.collection].map((item) => (
        <Option
          key={item.key}
          item={item}
          state={state}
        />
      ))}
      {props.loadingState === 'loadingMore' && (
        // Display a spinner at the bottom of the list if we're loading more.
        // role="option" is required for valid ARIA semantics since
        // we're inside a role="listbox".
        <Box
          role="option"
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
      )}
    </List>
  );
}

function Option({ item, state }: OptionProps) {
  let ref = React.useRef<HTMLLIElement>(null);
  let { optionProps, isSelected, isFocused } = useOption(
    {
      key: item.key,
    },
    state,
    ref
  );

  return (
    <ListItem
      {...optionProps}
      as="li"
      ref={ref}
      px="2"
      py="2"
      background={isFocused ? 'blue.50' : 'white'}
      color={isFocused ? 'blue.700' : 'gray.700'}
      fontWeight={isSelected ? 'bold' : 'normal'}
      cursor="default"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {item.rendered}
      {isSelected && <CheckIcon />}
    </ListItem>
  );
}
