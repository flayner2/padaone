import {
  ArrowDownIcon,
  ArrowUpIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { SortDirection } from '@react-types/shared';
import axios from 'axios';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useCollator } from 'react-aria';
import { useAsyncList } from 'react-stately';
import { debounce } from '../lib/debounce';
import { convertToFloatOrDefault } from '../lib/helpers';
import type {
  AsyncListDataDebouncedReturn,
  ColumnName,
  TablePaperInfo,
  TablePaperInfoKey,
} from '../lib/types';

const OFFSET_VALUE: number = 20;
const MAX_TAX_NAMES: number = 5;
const COLUMNS: ColumnName[] = [
  { name: 'PMID', key: 'pmid' },
  { name: 'Title', key: 'title' },
  { name: 'Year', key: 'yearPub' },
  { name: 'Last Author', key: 'lastAuthor' },
  { name: 'Citations', key: 'citations' },
  { name: '1st Layer', key: 'classification1stLay' },
  { name: '2nd Layer', key: 'classification2ndLay' },
  { name: 'Taxon Name', key: 'taxNames' },
];

function Browse() {
  // Data and state
  const [offset, setOffset] = useState(0);
  const [beingSorted, setBeingSorted] = useState('classification2ndLay');
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('descending');
  const [showGoTop, setShowGoTop] = useState(false);
  const [shadowList, setShadowList] = useState<TablePaperInfo[]>([]);
  const collator = useCollator({ numeric: true });

  // Scroll to top
  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    });
  }, []);

  function goToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // Async List

  // Key validation for type sanity
  function isValidColumn(value: React.Key): value is TablePaperInfoKey {
    return COLUMNS.map((column) => column['key']).includes(value as string);
  }

  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor) => {
      let res = await axios.get(cursor || `${queryUrl}?offset=${offset}`, {
        signal,
      });

      return res.data;
    }, 500);

    let data = await debouncedRequest(signal, cursor);

    return {
      items: data,
      cursor: `${queryUrl}?offset=${offset + OFFSET_VALUE}`,
    };
  }

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      return await getAsyncListDataDebounced('/api/allPapers', signal, cursor);
    },
    getKey(item) {
      return item.pmid;
    },
    initialSortDescriptor: {
      column: 'classification2ndLay',
      direction: 'descending',
    },
  });

  // Sort
  function sortList(
    a: TablePaperInfo,
    b: TablePaperInfo,
    direction: string,
    column: string
  ) {
    if (column && isValidColumn(column)) {
      let first;
      let second;

      if (
        column === 'classification1stLay' ||
        column === 'classification2ndLay'
      ) {
        let layerA = a[column];
        let layerB = b[column];

        if (layerA && layerB) {
          first = layerA.probability;
          second = layerB.probability;
        }
      } else if (column === 'taxNames') {
        let taxA = a[column];
        let taxB = b[column];

        if (taxA) {
          if (taxB) {
            first = taxA[0];
            second = taxB[0];
          } else {
            return -1;
          }
        } else if (taxB) {
          return 1;
        } else {
          return 0;
        }
      } else {
        first = a[column];
        second = b[column];
      }

      if (first != null && second != null) {
        let cmp = collator.compare(first.toString(), second.toString());

        if (direction === 'descending') {
          cmp *= -1;
        }

        return cmp;
      }
    }
    return 0;
  }

  function handleSortChange(column: string, direction: SortDirection) {
    if (beingSorted === column) {
      direction = sortDirection === 'descending' ? 'ascending' : 'descending';
      setSortDirection(direction);
    } else {
      if (sortDirection === 'ascending') {
        direction = 'descending';
        setSortDirection(direction);
      }
    }

    setBeingSorted(column);

    shadowList.sort((a, b) => sortList(a, b, direction, column));
  }

  useEffect(() => {
    if (!paperList.isLoading && paperList.items.length) {
      setShadowList((old) => [...old, ...paperList.items]);
      paperList.remove(...paperList.items.map((item) => item.pmid));
    }
  }, [paperList.items, paperList.isLoading]);

  useEffect(() => {
    paperList.loadMore();
  }, [offset]);

  useEffect(() => {
    if (!paperList.isLoading && shadowList.length) {
      shadowList.sort((a, b) => sortList(a, b, sortDirection, beingSorted));
    }
  }, [beingSorted, sortDirection, shadowList, paperList.isLoading]);

  // Utils
  function maxTaxaNames(list: Array<any>): number {
    return list.length < MAX_TAX_NAMES ? list.length + 1 : MAX_TAX_NAMES + 1;
  }

  return (
    <>
      <Head>
        <title>PADA-One | Browse the Database</title>
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
          marginBottom="1rem"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                {COLUMNS.map((column) => (
                  <Th
                    key={column.key}
                    onClick={() => {
                      handleSortChange(column.key, sortDirection);
                    }}
                    cursor="default"
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
              {shadowList.map((paper) => (
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
                    {paper.taxNames
                      ? paper.taxNames
                          .slice(0, maxTaxaNames(paper.taxNames))
                          .map((taxName, index, allNames) => (
                            <>
                              <Link
                                key={taxName}
                                href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${encodeURIComponent(
                                  taxName
                                )}`}
                                color="protBlue.400"
                                fontStyle="italic"
                                isExternal
                                _hover={{
                                  textDecoration: 'none',
                                  color: 'protBlue.lightHover',
                                }}
                              >
                                {taxName}
                              </Link>
                              {index < allNames.length - 1 && '; '}
                            </>
                          ))
                      : 'N/A'}
                    {paper.taxNames && paper.taxNames?.length > MAX_TAX_NAMES
                      ? '...'
                      : null}
                  </Td>
                </Tr>
              ))}
              {paperList.isLoading && (
                <Box
                  role="cell"
                  paddingTop="4"
                  paddingBottom="2"
                  marginTop="0.5rem"
                  marginBottom="0.5rem"
                  display="flex"
                  justifyContent="center"
                  position="absolute"
                  left="50%"
                >
                  <Spinner
                    color="blue.400"
                    size="md"
                  />
                </Box>
              )}
            </Tbody>
          </Table>
        </Box>
        {!paperList.isLoading && shadowList.length ? (
          <Button
            width="100%"
            background="protBlue.300"
            _hover={{
              background: 'protBlue.veryLightHover',
            }}
            onClick={() => {
              setOffset((old) => old + OFFSET_VALUE);
            }}
          >
            <ArrowDownIcon />
          </Button>
        ) : null}
      </Flex>

      {showGoTop && (
        <Button
          position="fixed"
          bottom="15px"
          right="10px"
          onClick={goToTop}
          size="md"
          background="protGray.100"
          _hover={{
            background: 'protGray.300',
          }}
        >
          <ArrowUpIcon />
        </Button>
      )}
    </>
  );
}

export default Browse;
