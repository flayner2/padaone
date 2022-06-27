import { Td } from '@chakra-ui/react';
import { useRef } from 'react';
import { mergeProps, useFocusRing, useTableCell } from 'react-aria';
import type { TableCellProps } from '../../lib/types';

function TableCell({ cell, state }: TableCellProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const { gridCellProps } = useTableCell({ node: cell }, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <Td
      {...mergeProps(gridCellProps, focusProps)}
      outline={isFocusVisible ? '2px solid orange' : 'none'}
      ref={ref}
      maxWidth="10vw"
    >
      {cell.rendered}
    </Td>
  );
}

export default TableCell;
