import {
  useTableSelectionCheckbox,
  useCheckbox,
  useTableCell,
} from 'react-aria';
import { useToggleState } from 'react-stately';
import { useRef } from 'react';
import type { TableCellProps } from '../../lib/types';
import { Td, Input } from '@chakra-ui/react';

function TableCheckboxCell({ cell, state }: TableCellProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const { gridCellProps } = useTableCell({ node: cell }, state, ref);
  const { checkboxProps } = useTableSelectionCheckbox(
    { key: cell.parentKey || Math.floor(Math.random() * 10000) },
    state
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const { inputProps } = useCheckbox(
    checkboxProps,
    useToggleState(checkboxProps),
    inputRef
  );

  return (
    <Td
      {...gridCellProps}
      ref={ref}
    >
      <Input
        {...inputProps}
        size="md"
      />
    </Td>
  );
}

export default TableCheckboxCell;
