import * as Fs from 'node:fs/promises';
import path from 'path';
import axios from 'axios';
import { useState } from 'react';
import type { TablePaperInfo, ColumnName } from '../lib/types';
import { useAsyncList } from 'react-stately';
import {
  Flex,
  Link,
  Table,
  Td,
  Tbody,
  Thead,
  Tr,
  Th,
  RadioGroup,
  Radio,
  Button,
  Box,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react';
import { ArrowDownIcon } from '@chakra-ui/icons';
import { convertToFloatOrDefault } from '../lib/helpers';
import Head from 'next/head';
import { InferGetServerSidePropsType } from 'next';

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

  const queryUrl = '/api/papers';
  const filterText =
    'firstLayerMin=80&firstLayerMax=100&secondLayerMin=90&secondLayerMax=100';

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      let { data } = await axios.get(
        cursor || `${queryUrl}?${filterText}&offset=${offset}`,
        {
          signal,
        }
      );

      const finalPapers = data.filter((paper: TablePaperInfo) =>
        files.includes(paper.pmid.toString()) ? false : true
      );

      return {
        items: finalPapers,
        cursor: `${queryUrl}?${filterText}&offset=${offset + OFFSET_VALUE}`,
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
          overflowX="auto"
          width="100%"
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
                  <Td>{paper.taxIDs ? 'Yes' : 'No'}</Td>
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
            </Tbody>
          </Table>
        </Box>
        <Button
          onClick={() => {
            setOffset((old) => old + OFFSET_VALUE);
            paperList.loadMore();
          }}
        >
          <ArrowDownIcon />
        </Button>
      </Flex>
    </>
  );
}

export async function getServerSideProps() {
  const dirPath = path.resolve(path.join(process.cwd(), '../curation'));
  let files: string[] = [];

  try {
    const foundPositive = await Fs.readdir(
      path.resolve(path.join(dirPath, 'positive'))
    );
    const foundNegative = await Fs.readdir(
      path.resolve(path.join(dirPath, 'positive'))
    );

    files.push(...foundPositive, ...foundNegative);
    files = files.map((file) => file.replace('.sql', ''));
  } catch {
    return { props: { files: [] } };
  }

  return { props: { files } };
}

export default Papers;
