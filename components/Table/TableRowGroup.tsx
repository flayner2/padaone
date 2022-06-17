import { useTableRowGroup } from 'react-aria';
import type { TableRowGroupProps } from '../../lib/types';

function TableRowGroup({ type: Element, style, children }: TableRowGroupProps) {
  const { rowGroupProps } = useTableRowGroup();

  return (
    <Element
      {...rowGroupProps}
      style={style}
    >
      {children}
    </Element>
  );
}

export default TableRowGroup;
