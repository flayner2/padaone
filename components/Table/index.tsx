import { Table as ChakraTable, Tbody, Thead } from '@chakra-ui/react';
import type { TableProps } from '@react-aria/table';
import type { TableStateProps } from '@react-stately/table';
import { useRef } from 'react';
import { useTable } from 'react-aria';
import { useTableState } from 'react-stately';
import TableCell from './TableCell';
import TableCheckboxCell from './TableCheckboxCell';
import TableColumnHeader from './TableColumnHeader';
import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';
import TableRowGroup from './TableRowGroup';
import TableSelectAllCell from './TableSelectAllCell';

function Table(props: TableStateProps<object> & TableProps<object>) {
  const { selectionMode, selectionBehavior } = props;
  const state = useTableState({
    ...props,
    showSelectionCheckboxes:
      selectionMode === 'multiple' && selectionBehavior !== 'replace',
  });

  const ref = useRef<HTMLTableElement>(null);
  const { collection } = state;
  const { gridProps } = useTable(props, state, ref);

  return (
    <ChakraTable
      {...gridProps}
      ref={ref}
    >
      <TableRowGroup
        type={Thead}
        style={{
          borderBottom: '2px solid protGray.100',
        }}
      >
        {collection.headerRows.map((headerRow) => (
          <TableHeaderRow
            key={headerRow.key}
            item={headerRow}
            state={state}
          >
            {[...headerRow.childNodes].map((column) =>
              column.props.isSelectionCell ? (
                <TableSelectAllCell
                  key={column.key}
                  column={column}
                  state={state}
                />
              ) : (
                <TableColumnHeader
                  key={column.key}
                  column={column}
                  state={state}
                />
              )
            )}
          </TableHeaderRow>
        ))}
      </TableRowGroup>

      <TableRowGroup type={Tbody}>
        {[...collection.body.childNodes].map((row) => (
          <TableRow
            key={row.key}
            item={row}
            state={state}
          >
            {[...row.childNodes].map((cell) =>
              cell.props.isSelectionCell ? (
                <TableCheckboxCell
                  key={cell.key}
                  cell={cell}
                  state={state}
                />
              ) : (
                <TableCell
                  key={cell.key}
                  cell={cell}
                  state={state}
                />
              )
            )}
          </TableRow>
        ))}
      </TableRowGroup>
    </ChakraTable>
  );
}

export default Table;
