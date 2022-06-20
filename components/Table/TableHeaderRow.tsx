import { Tr } from '@chakra-ui/react';
import { useRef } from 'react';
import { useTableHeaderRow } from 'react-aria';
import type { TableRowProps } from '../../lib/types';

function TableHeaderRow({ item, state, children }: TableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);
  const { rowProps } = useTableHeaderRow({ node: item }, state, ref);

  return (
    <Tr
      {...rowProps}
      ref={ref}
    >
      {children}
    </Tr>
  );
}

export default TableHeaderRow;
