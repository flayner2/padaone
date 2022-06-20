import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Th } from '@chakra-ui/react';
import { useRef } from 'react';
import { mergeProps, useFocusRing, useTableColumnHeader } from 'react-aria';
import type { TableColumnHeaderProps } from '../../lib/types';

function TableColumnHeader({ column, state }: TableColumnHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const { columnHeaderProps } = useTableColumnHeader(
    { node: column },
    state,
    ref
  );
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <Th
      {...mergeProps(columnHeaderProps, focusProps)}
      colSpan={column.colspan}
      textAlign={column?.colspan && column?.colspan > 1 ? 'center' : 'left'}
      outline={isFocusVisible ? '2px solid orange' : 'none'}
      cursor="default"
      ref={ref}
    >
      {column.rendered}
      {column.props.allowsSorting &&
        (state.sortDescriptor?.direction === 'ascending' ? (
          <TriangleUpIcon
            visibility={
              state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'
            }
          />
        ) : (
          <TriangleDownIcon
            visibility={
              state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'
            }
          />
        ))}
    </Th>
  );
}

export default TableColumnHeader;
