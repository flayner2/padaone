import { useTableRow, useFocusRing, mergeProps } from 'react-aria';
import { useRef } from 'react';
import { Tr } from '@chakra-ui/react';
import type { TableRowProps } from '../../lib/types';

function TableRow({ item, children, state }: TableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);
  const isSelected = state.selectionManager.isSelected(item.key);
  const { rowProps, isPressed } = useTableRow(
    {
      node: item,
    },
    state,
    ref
  );
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <Tr
      background={
        isSelected
          ? 'blueviolet'
          : isPressed
          ? 'protGray.100'
          : item.index && item.index % 2
          ? 'protBlue.100'
          : 'none'
      }
      color={isSelected ? 'white' : undefined}
      outline={isFocusVisible ? '2px solid orange' : 'none'}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
    >
      {children}
    </Tr>
  );
}

export default TableRow;
