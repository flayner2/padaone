import { Tr } from '@chakra-ui/react';
import { useRef } from 'react';
import { useTableHeaderRow } from 'react-aria';
import type { TableHeaderRowProps } from '../../lib/types';

function TableHeaderRow<T>({ item, state, children }: TableHeaderRowProps<T>) {
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
