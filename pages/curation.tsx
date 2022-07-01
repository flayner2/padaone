import { ArrowDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Link,
  Radio,
  RadioGroup,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import axios from 'axios';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useAsyncList } from 'react-stately';
import { convertToFloatOrDefault } from '../lib/helpers';
import type { ColumnName, TablePaperInfo } from '../lib/types';
import { findCuratedPapers } from './api/curationPapers';

const OFFSET_VALUE: number = 20;
const COLUMNS: ColumnName[] = [
  { name: 'PMID', key: 'pmid' },
  { name: 'Title', key: 'title' },
  { name: '1st Layer', key: 'classification1stLay' },
  { name: '2nd Layer', key: 'classification2ndLay' },
  { name: 'Has Gene IDs', key: 'genIDs' },
  { name: 'Status', key: 'status' },
  { name: 'Submit', key: 'submit' },
];

function Papers({
  files,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [offset, setOffset] = useState(0);
  const [papersStatus, setPaperStatus] = useState<{ [pmid: number]: string }>(
    {}
  );
  const [errorState, setErrorState] = useState<{ [pmid: number]: string }>({});

  const queryUrl = '/api/curationPapers';

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      let { data } = await axios.get(cursor || `${queryUrl}?offset=${offset}`, {
        signal,
      });

      const finalPapers = data.filter((paper: TablePaperInfo) =>
        files.includes(paper.pmid.toString()) ? false : true
      );

      return {
        items: finalPapers,
        cursor: `${queryUrl}?offset=${offset + OFFSET_VALUE}`,
      };
    },
    getKey(item) {
      return item.pmid;
    },
  });

  async function handleSubmit(pmid: number, statusName: string) {
    if (!statusName) {
      setErrorState((old) => ({
        ...old,
        ...{ [pmid]: 'Please choose a status.' },
      }));
      return;
    }

    try {
      const res = await axios.post('/api/curation', { pmid, statusName });

      if (res.data.found) {
        if (res.data.sameStatus) {
          alert(
            'This paper was already reviewed with this same status, and the file was already created.'
          );
        } else {
          alert(
            'This paper was already reviewed with a different status, and the file was already created.'
          );
        }
      }

      paperList.remove(pmid);
    } catch (error) {
      setErrorState((old) => ({
        ...old,
        ...{ [pmid]: 'Something went wrong while submiting.' },
      }));
    }
  }

  return (
    <>
      <Head>
        <title>PADA-One | Search Results</title>
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
          overflowX="auto"
          width="100%"
          marginBottom="1rem"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                {COLUMNS.map((column) => (
                  <Th key={column.key}>{column.name}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {paperList.items.map((paper) => (
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
                  <Td>
                    {convertToFloatOrDefault(
                      paper.classification1stLay?.probability,
                      4,
                      1,
                      0
                    )}
                  </Td>
                  <Td>
                    {convertToFloatOrDefault(
                      paper.classification2ndLay?.probability,
                      4,
                      1,
                      0
                    )}
                  </Td>
                  <Td>{paper.taxNames ? 'Yes' : 'No'}</Td>
                  <Td>
                    <FormControl
                      isInvalid={errorState[paper.pmid] ? true : false}
                    >
                      <RadioGroup
                        onChange={(v) => {
                          setPaperStatus((old) => ({
                            ...old,
                            ...{ [paper.pmid]: v },
                          }));
                          setErrorState((old) => {
                            delete old[paper.pmid];
                            return old;
                          });
                        }}
                      >
                        <Radio
                          value="positive"
                          marginRight="0.5rem"
                        >
                          Positive
                        </Radio>
                        <Radio value="negative">Negative</Radio>
                      </RadioGroup>
                      {errorState[paper.pmid] && (
                        <FormErrorMessage>
                          {errorState[paper.pmid]}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Td>
                  <Td>
                    <Button
                      type="submit"
                      onClick={() => {
                        handleSubmit(paper.pmid, papersStatus[paper.pmid]);
                      }}
                    >
                      Submit
                    </Button>
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
        {!paperList.isLoading && paperList.items.length ? (
          <Button
            width="100%"
            background="protBlue.300"
            _hover={{
              background: 'protBlue.veryLightHover',
            }}
            onClick={() => {
              setOffset((old) => old + OFFSET_VALUE);
              paperList.loadMore();
            }}
          >
            <ArrowDownIcon />
          </Button>
        ) : null}
      </Flex>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const files = await findCuratedPapers();
    return { props: { files } };
  } catch {
    return { props: { files: [] } };
  }
}

export default Papers;
