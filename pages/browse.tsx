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
import type { SortDirection, SortDescriptor } from '@react-types/shared';
import axios from 'axios';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAsyncList } from 'react-stately';
import { debounce } from '../lib/debounce';
import { convertToFloatOrDefault } from '../lib/helpers';
import type {
  AsyncListDataDebouncedReturn,
  ColumnName,
  TablePaperInfoRawQuery,
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
  const [sortColumn, setSortColumn] = useState('classification2ndLay');
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('descending');
  const [showGoTop, setShowGoTop] = useState(false);

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
  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined,
    sortDescriptor: SortDescriptor
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor, searchUrl) => {
      let res = await axios.get(cursor || searchUrl, {
        signal,
      });

      return res.data;
    }, 500);

    const actualOffset = cursor ? offset : 0;

    const searchUrl = `${queryUrl}?offset=${actualOffset}${
      sortDescriptor
        ? `&sortColumn=${sortDescriptor.column}&sortDirection=${sortDescriptor.direction}`
        : ''
    }`;

    let data = await debouncedRequest(signal, cursor, searchUrl);

    return {
      items: data,
      cursor: `${queryUrl}?offset=${actualOffset + OFFSET_VALUE}${
        sortDescriptor
          ? `&sortColumn=${sortDescriptor.column}&sortDirection=${sortDescriptor.direction}`
          : ''
      }`,
    };
  }

  let paperList = useAsyncList<TablePaperInfoRawQuery>({
    async load({ signal, cursor, sortDescriptor }) {
      return await getAsyncListDataDebounced(
        '/api/allPapers',
        signal,
        cursor,
        sortDescriptor
      );
    },
    getKey(item) {
      return item.pmid;
    },
    initialSortDescriptor: {
      column: 'classification2ndLay',
      direction: 'descending',
    },
  });

  function handleSortChange(column: string) {
    if (sortColumn === column) {
      setSortDirection(
        sortDirection === 'descending' ? 'ascending' : 'descending'
      );
    } else {
      if (sortDirection === 'ascending') {
        setSortDirection('descending');
      }
    }

    setSortColumn(column);
  }

  useEffect(() => {
    if (!(paperList.loadingState === 'sorting')) {
      paperList.loadMore();
    }
  }, [offset]);

  useEffect(() => {
    if (!paperList.isLoading && paperList.items.length) {
      setOffset(0);
      paperList.sort({ column: sortColumn, direction: sortDirection });
    }
  }, [sortColumn, sortDirection]);

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
          href="/logo.png"
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
                      handleSortChange(column.key);
                    }}
                    cursor="default"
                  >
                    {column.name}{' '}
                    {sortDirection === 'ascending' ? (
                      <TriangleUpIcon
                        visibility={
                          sortColumn === column.key ? 'visible' : 'hidden'
                        }
                      />
                    ) : (
                      <TriangleDownIcon
                        visibility={
                          sortColumn === column.key ? 'visible' : 'hidden'
                        }
                      />
                    )}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {!(paperList.loadingState === 'sorting')
                ? paperList.items.map((paper) => (
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
                          paper.probability1stLay,
                          0,
                          100,
                          0
                        )}
                        %
                      </Td>
                      <Td>
                        {convertToFloatOrDefault(
                          paper.probability2ndLay,
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
                        {paper.taxNames &&
                        paper.taxNames?.length > MAX_TAX_NAMES
                          ? '...'
                          : null}
                      </Td>
                    </Tr>
                  ))
                : null}
              {(paperList.isLoading ||
                paperList.loadingState === 'sorting') && (
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
        {!paperList.isLoading && paperList.items.length ? (
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
