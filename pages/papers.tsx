import axios from 'axios';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Flex, Box, Link, Text } from '@chakra-ui/react';
import { convertToFloatOrDefault } from '../lib/helpers';
import Head from 'next/head';

const OFFSET_VALUE: number = 20;
const COLUMNS: ColumnName[] = [
  { name: 'PMID', key: 'pmid' },
  { name: 'Title', key: 'title' },
  { name: 'Year', key: 'year' },
  { name: 'Last Author', key: 'lastAuthor' },
  { name: 'Citations', key: 'citations' },
  { name: '1st Layer', key: 'classification1stLay' },
  { name: '2nd Layer', key: 'classification2ndLay' },
  { name: 'Taxon Name', key: 'taxIDs' },
];

function Papers() {
  const router = useRouter();
  const queryString = decodeURIComponent(
    router.asPath.replace(/^\/papers\?/, '')
  );
  const [offset, setOffset] = useState(0);

  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined,
    filterText: string | undefined
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor, filterText) => {
      let res = await axios.get(
        cursor || `${queryUrl}?${filterText}&offset=${offset}`,
        {
          signal,
        }
      );

      return res.data;
    }, 0);

    let data = await debouncedRequest(signal, cursor, filterText);
    console.log(`${queryUrl}?${filterText}&offset=${offset}`);
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
    // async sort({ items, sortDescriptor }) {
    //   return {
    //     items: items.sort((a, b) => {
    //       if (!sortDescriptor.column) {
    //         return 0;
    //       } else {
    //         let first;
    //         let second;

    //         const isTaxId = sortDescriptor.column === 'taxIDs';

    //         if (isTaxId) {
    //           first = Array.isArray(a[sortDescriptor.column])
    //             ? a[sortDescriptor.column][0]
    //             : -1;
    //           second = Array.isArray(b[sortDescriptor.column])
    //             ? b[sortDescriptor.column][0]
    //             : -1;
    //         }

    //         const isProbability =
    //           sortDescriptor.column === 'classification1stLay' ||
    //           sortDescriptor.column === 'classification2ndLay';
    //         first = isProbability
    //           ? a[sortDescriptor.column]['probability']
    //           : a[sortDescriptor.column];
    //         second = isProbability
    //           ? b[sortDescriptor.column]['probability']
    //           : b[sortDescriptor.column];
    //         let cmp =
    //           (parseInt(first) || first) < (parseInt(second) || second)
    //             ? -1
    //             : 1;

    //         if (sortDescriptor.direction === 'descending') {
    //           cmp *= -1;
    //         }

    //         return cmp;
    //       }
    //     }),
    //   };
    // },
  });

  // pagination
  let ward = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(ward.current);

    if (!ward.current) {
      return;
    }

    const observer = new IntersectionObserver(() => {
      setOffset((previousOffset) => previousOffset + OFFSET_VALUE);
    });

    observer.observe(ward.current);

    return () => observer.disconnect();
  }, [ward]);

  useEffect(() => paperList.loadMore(), [offset]);

  return (
    <>
      <Head>
        <title>Prot DB | Search Results</title>
        <meta
          name="description"
          content="A database that hosts scientific papers predicted to describe protective antigens (PAgs) from a variety of organisms."
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <Flex
        minHeight="100vh"
        width="100%"
        padding="2rem 4rem"
        flex={1}
        alignItems="center"
        flexDirection="column"
      >
        <Table
          sortDescriptor={paperList.sortDescriptor}
          onSortChange={paperList.sort}
          isVirtualized
        >
          <TableHeader columns={COLUMNS}>
            {(column) => (
              <Column
                key={column.key}
                allowsSorting
              >
                {column.name}
              </Column>
            )}
          </TableHeader>
          <TableBody
            items={paperList.items}
            loadingState={paperList.loadingState}
            //onLoadMore={paperList.loadMore}
          >
            {(item) => (
              <Row key={item.pmid}>
                <Cell>
                  <Link
                    href={`/paper/${item.pmid}`}
                    color="protBlue.400"
                    isExternal
                    _hover={{
                      textDecoration: 'none',
                      color: 'protBlue.lightHover',
                    }}
                  >
                    {item.pmid}
                  </Link>
                </Cell>
                <Cell>
                  <Text>{item.title}</Text>
                </Cell>
                <Cell>
                  <Text>{item.yearPub || 'NA'}</Text>
                </Cell>
                <Cell>
                  <Text>{item.lastAuthor || 'NA'}</Text>
                </Cell>
                <Cell>
                  <Text>{item.citations}</Text>
                </Cell>
                <Cell>
                  <Text>
                    {convertToFloatOrDefault(
                      item.classification1stLay?.probability,
                      0,
                      100,
                      0
                    )}
                    %
                  </Text>
                </Cell>
                <Cell>
                  <Text>
                    {convertToFloatOrDefault(
                      item.classification2ndLay?.probability,
                      0,
                      100,
                      0
                    )}
                    %
                  </Text>
                </Cell>
                <Cell>{item.taxIDs?.join(', ') || 'NA'}</Cell>
              </Row>
            )}
          </TableBody>
        </Table>

        {!paperList.isLoading && paperList.items.length ? (
          <Box
            ref={ward}
            background="red"
            width="10px"
            height="10px"
          ></Box>
        ) : null}
      </Flex>
    </>
  );
}

export default Papers;
