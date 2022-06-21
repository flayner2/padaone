import { Input, Th } from '@chakra-ui/react';
import { useRef } from 'react';
import {
  useCheckbox,
  useTableColumnHeader,
  useTableSelectAllCheckbox,
  VisuallyHidden,
} from 'react-aria';
import { useToggleState } from 'react-stately';
import { TableColumnHeaderProps } from '../../lib/types';

function TableSelectAllCell({ column, state }: TableColumnHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const isSingleSelectionMode =
    state.selectionManager.selectionMode === 'single';
  const { columnHeaderProps } = useTableColumnHeader(
    { node: column },
    state,
    ref
  );

  const { checkboxProps } = useTableSelectAllCheckbox(state);
  const inputRef = useRef(null);
  const { inputProps } = useCheckbox(
    checkboxProps,
    useToggleState(checkboxProps),
    inputRef
  );

  return (
    <Th
      {...columnHeaderProps}
      ref={ref}
    >
      {isSingleSelectionMode ? (
        <VisuallyHidden>{inputProps['aria-label']}</VisuallyHidden>
      ) : (
        <Input
          {...inputProps}
          ref={inputRef}
          size="md"
        />
      )}
    </Th>
  );
}

export default TableSelectAllCell;
