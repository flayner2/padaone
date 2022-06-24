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
  Text,
  Box,
} from '@chakra-ui/react';
import { ArrowDownIcon } from '@chakra-ui/icons';
import { convertToFloatOrDefault } from '../lib/helpers';
import Head from 'next/head';

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

function Papers() {
  const [offset, setOffset] = useState(0);
  const queryUrl = '/api/papers';
  const filterText =
    'firstLayerMin=80&firstLayerMax=100&secondLayerMin=90&secondLayerMax=100';

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      let res = await axios.get(
        cursor || `${queryUrl}?${filterText}&offset=${offset}`,
        {
          signal,
        }
      );

      return {
        items: res.data,
        cursor: `${queryUrl}?${filterText}&offset=${offset + OFFSET_VALUE}`,
      };
    },
    getKey(item) {
      return item.pmid;
    },
  });

  const [papersStatus, setPaperStatus] = useState({});

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
                  <Td maxWidth="20vw">
                    <Text>{paper.title}</Text>
                  </Td>
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
                    <RadioGroup
                      onChange={(v) => {
                        setPaperStatus((old) => ({
                          ...old,
                          ...{ [paper.pmid]: v },
                        }));
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
                  </Td>
                  <Td>
                    <Button
                      type="submit"
                      onClick={() => {
                        paperList.remove(paper.pmid);
                        console.log(paperList.items);
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

export default Papers;
