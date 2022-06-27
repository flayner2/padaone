import axios from 'axios';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  AsyncListDataDebouncedReturn,
  TablePaperInfo,
  ColumnName,
} from '../lib/types';
import type { SortDirection } from '@react-types/shared';
import { debounce } from '../lib/debounce';
import { useAsyncList } from 'react-stately';
import {
  Flex,
  Box,
  Link,
  Td,
  Th,
  Thead,
  Tbody,
  Tr,
  Table,
  Spinner,
  Button,
} from '@chakra-ui/react';
import {
  TriangleUpIcon,
  TriangleDownIcon,
  ArrowDownIcon,
} from '@chakra-ui/icons';
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
  const [beingSorted, setBeingSorted] = useState('classification2ndLay');
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('descending');

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
    getKey(item) {
      return item.pmid;
    },
    initialSortDescriptor: {
      column: 'classification2ndLay',
      direction: 'descending',
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          if (!sortDescriptor.column) {
            return 0;
          } else {
            let first;
            let second;

            const isTaxId = sortDescriptor.column === 'taxIDs';

            if (isTaxId) {
              first = Array.isArray(a[sortDescriptor.column])
                ? a[sortDescriptor.column][0]
                : -1;
              second = Array.isArray(b[sortDescriptor.column])
                ? b[sortDescriptor.column][0]
                : -1;
            }

            const isProbability =
              sortDescriptor.column === 'classification1stLay' ||
              sortDescriptor.column === 'classification2ndLay';
            first = isProbability
              ? a[sortDescriptor.column]['probability']
              : a[sortDescriptor.column];
            second = isProbability
              ? b[sortDescriptor.column]['probability']
              : b[sortDescriptor.column];
            let cmp =
              (parseInt(first) || first) < (parseInt(second) || second)
                ? -1
                : 1;

            if (sortDescriptor.direction === 'descending') {
              cmp *= -1;
            }

            return cmp;
          }
        }),
      };
    },
  });

  function handleSortChange(column: string) {
    setBeingSorted(column);
    setSortDirection(
      sortDirection === 'descending' ? 'ascending' : 'descending'
    );
  }

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
        <Box
          width="100%"
          overflowX="auto"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                {COLUMNS.map((column) => (
                  <Th
                    key={column.key}
                    onClick={() => {
                      handleSortChange(column.key);
                      paperList.sort({
                        column: beingSorted,
                        direction: sortDirection,
                      });
                    }}
                  >
                    {column.name}{' '}
                    {sortDirection === 'ascending' ? (
                      <TriangleUpIcon
                        visibility={
                          beingSorted === column.key ? 'visible' : 'hidden'
                        }
                      />
                    ) : (
                      <TriangleDownIcon
                        visibility={
                          beingSorted === column.key ? 'visible' : 'hidden'
                        }
                      />
                    )}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {paperList.isLoading ? (
                <Box
                  role="cell"
                  pt="4"
                  display="flex"
                  pb="2"
                  justifyContent="center"
                  position="absolute"
                  left="50%"
                >
                  <Spinner
                    color="blue.400"
                    size="md"
                  />
                </Box>
              ) : (
                paperList.items.map((paper) => (
                  <Tr key={paper.pmid}>
                    <Td>
                      <Link
                        href={`/paper/${paper.pmid}`}
                        color="protBlue.400"
                        isExternal
                        _hover={{
                          textDecoration: 'none',
                          color: 'protBlue.lightHover',
                        }}
                      >
                        {paper.pmid}
                      </Link>
                    </Td>
                    <Td maxWidth="20vw">{paper.title}</Td>
                    <Td>{paper.yearPub}</Td>
                    <Td>{paper.lastAuthor}</Td>
                    <Td>{paper.citations}</Td>
                    <Td>
                      {convertToFloatOrDefault(
                        paper.classification1stLay?.probability,
                        0,
                        100,
                        0
                      )}
                      %
                    </Td>
                    <Td>
                      {convertToFloatOrDefault(
                        paper.classification2ndLay?.probability,
                        0,
                        100,
                        0
                      )}
                      %
                    </Td>
                    <Td maxWidth="15vw">
                      {paper.taxIDs ? paper.taxIDs.join(',') : 'N/A'}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

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
