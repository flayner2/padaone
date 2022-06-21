import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type {
  AsyncListDataDebouncedReturn,
  TablePaperInfo,
  ColumnName,
} from '../lib/types';
import { debounce } from '../lib/debounce';
import { useAsyncList } from 'react-stately';
import Table from '../components/Table';
import {
  Cell,
  Row,
  Column,
  TableBody,
  TableHeader,
} from '@react-stately/table';
import { Flex } from '@chakra-ui/react';
import { convertToFloatOrDefault } from '../lib/helpers';

const OFFSET_VALUE: number = 20;
const COLUMNS: ColumnName[] = [
  { name: 'PMID', key: 'pmid' },
  { name: 'Title', key: 'title' },
  { name: 'Year', key: 'year' },
  { name: 'Last Author', key: 'lastAuthor' },
  { name: 'Citations', key: 'citations' },
  { name: '1st Layer', key: 'firstLayer' },
  { name: '2nd Layer', key: 'secondLayer' },
  { name: 'Taxon Name', key: 'taxonName' },
];

function Papers() {
  const router = useRouter();
  const queryString = decodeURIComponent(
    router.asPath.replace(/^\/papers\?/, '')
  );
  const [offset, setOffset] = useState(0);

  // Async lists
  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined,
    filterText: string | undefined
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor, filterText) => {
      let res = await axios.get(cursor || `${queryUrl}?${filterText}`, {
        signal,
      });

      return res.data;
    }, 0);

    let data = await debouncedRequest(signal, cursor, filterText);

    setOffset((previousOffset) => previousOffset + OFFSET_VALUE);

    return {
      items: data,
      cursor: `${queryUrl}?${filterText}&offset=${offset}`,
    };
  }

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      return await getAsyncListDataDebounced(
        '/api/papers',
        signal,
        cursor,
        queryString
      );
    },
  });

  return (
    <Flex
      minHeight="100vh"
      width="100vw"
      padding="2rem 4rem"
      flex={1}
      justifyContent="center"
    >
      <Table>
        <TableHeader columns={COLUMNS}>
          {(column) => <Column key={column.key}>{column.name}</Column>}
        </TableHeader>
        <TableBody items={paperList.items}>
          {(item) => (
            <Row key={item.pmid}>
              <Cell>{item.pmid}</Cell>
              <Cell>{item.title}</Cell>
              <Cell>{item.yearPub}</Cell>
              <Cell>{item.lastAuthor}</Cell>
              <Cell>{item.citations}</Cell>
              <Cell>
                {convertToFloatOrDefault(
                  item.classification1stLay?.probability,
                  0,
                  100,
                  0
                )}
                %
              </Cell>
              <Cell>
                {convertToFloatOrDefault(
                  item.classification2ndLay?.probability,
                  0,
                  100,
                  0
                )}
                %
              </Cell>
              <Cell>{item.taxIDs?.join(', ')}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Flex>
  );
}

export default Papers;
