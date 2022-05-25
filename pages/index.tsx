import { Search2Icon, TriangleDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Select,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import type { InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useAsyncList } from 'react-stately';
import { Autocomplete, Item } from '../components/Autocomplete';
import { debounce } from '../lib/debounce';
import { prisma } from '../lib/prisma';
import type {
  AsyncListDataDebouncedReturn,
  Journal,
  LanguagePub,
  PaperTitlePMID,
} from '../lib/types';
import { DateRangePicker } from '../components/DateRangePicker';
import { today, now, getLocalTimeZone } from '@internationalized/date';

const OFFSET_VALUE: number = 20;

function Home({
  languages,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  const [offset, setOffset] = useState(0);

  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined,
    filterText: string | undefined
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor, filterText) => {
      let res = await axios.get(cursor || `${queryUrl}=${filterText}`, {
        signal,
      });

      return res.data;
    }, 500);

    let data = await debouncedRequest(signal, cursor, filterText);

    setOffset((previousOffset) => previousOffset + OFFSET_VALUE);

    return {
      items: data,
      cursor: `${queryUrl}=${filterText}&offset=${offset}`,
    };
  }

  let paperList = useAsyncList<PaperTitlePMID>({
    async load({ signal, cursor, filterText }) {
      return getAsyncListDataDebounced(
        '/api/getAutocompletePapers?paperTitle',
        signal,
        cursor,
        filterText
      );
    },
  });

  let journalList = useAsyncList<Journal>({
    async load({ signal, cursor, filterText }) {
      return getAsyncListDataDebounced(
        '/api/getAutocompleteJournals?journalName',
        signal,
        cursor,
        filterText
      );
    },
  });

  return (
    <Flex
      display="flex"
      justifyContent="center"
    >
      <Head>
        <title>Prot DB</title>
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
        width="100vw"
        padding="3rem 6rem"
        flex={1}
        flexDirection="column"
        justifyContent="space-betwen"
      >
        <Box>
          {/* Top text */}
          <Heading
            as="h1"
            size="lg"
            color="protBlack.100"
            fontWeight="semibold"
            marginBottom="1rem"
          >
            Prot-DB
          </Heading>

          <Text
            marginBottom="1rem"
            textAlign="justify"
            color="protBlack.100"
          >
            XXX (database’s name) is a database that hosts scientific papers
            predicted to describe protective antigens (PAgs) from a variety of
            organisms. This web tool enables the user to mine PAgs in the
            biomedical literature based on some pieces of information associated
            to every article, such as probabilities of describing PAgs, number
            of citations, year of publication, as well as taxa and genes
            involved in the study. Also, the user can find links to official{' '}
            <Link
              href="https://www.ncbi.nlm.nih.gov/"
              color="protBlue.400"
              isExternal
              _hover={{
                textDecoration: 'none',
              }}
            >
              NCBI
            </Link>{' '}
            resources related to each paper. Click on{' '}
            <Link
              href="/browse"
              color="protBlue.400"
              _hover={{
                textDecoration: 'none',
                color: 'protBlue.lightHover',
              }}
            >
              Browse
            </Link>{' '}
            to begin browsing the entire database, or use the{' '}
            <Link
              href="#search-form"
              color="protBlue.400"
              _hover={{
                textDecoration: 'none',
              }}
            >
              Search
            </Link>{' '}
            boxes below to either find a specific paper or multiple papers
            according to a set of filters.
          </Text>
        </Box>

        {/* Container for both forms, just for the scroll */}
        <Box id="search-form">
          {/* Top search form */}
          <Flex
            flexDirection="column"
            marginBottom="2rem"
          >
            <Text
              fontSize="xl"
              padding="1rem 0 1rem"
              color="protBlack.100"
            >
              Find a specific paper by title or PMID:
            </Text>
            <Flex justifyContent="space-between">
              <Autocomplete
                label="Title"
                items={paperList.items}
                inputValue={paperList.filterText}
                onInputChange={paperList.setFilterText}
                loadingState={paperList.loadingState}
                onLoadMore={paperList.loadMore}
                button={
                  <Button
                    background="protBlue.300"
                    _hover={{
                      background: 'protBlue.veryLightHover',
                    }}
                  >
                    <Search2Icon color="protBlack.100" />
                  </Button>
                }
                placeholder="Start typing to get suggestions..."
                placeholderProps={{
                  color: 'protBlue.900',
                  fontSize: 'sm',
                }}
                labelProps={{ color: 'protBlack.100', fontSize: 'md' }}
                boxProps={{ width: '85%', marginRight: '1rem' }}
                inputProps={{
                  background: 'protGray.500',
                  color: 'protBlack.100',
                  borderRadius: '8px',
                }}
              >
                {(item) => <Item key={item.pmid}>{item.title}</Item>}
              </Autocomplete>

              <FormControl width="40%">
                <FormLabel
                  fontSize="md"
                  color="protBlack.100"
                >
                  PMID
                </FormLabel>
                <InputGroup>
                  <InputRightElement>
                    <Button
                      background="protBlue.300"
                      _hover={{
                        background: 'protBlue.veryLightHover',
                      }}
                    >
                      <Search2Icon color="protBlack.100" />
                    </Button>
                  </InputRightElement>
                  <Input
                    placeholder="E.g.: 123"
                    _placeholder={{
                      color: 'protBlue.900',
                      fontSize: 'sm',
                    }}
                    background="protGray.500"
                    color="protBlack.100"
                    borderRadius="8px"
                  />
                </InputGroup>
              </FormControl>
            </Flex>
          </Flex>

          {/* Bottom search form */}
          <Flex
            flexDirection="column"
            justifyContent="space-between"
          >
            <Text
              fontSize="xl"
              padding="1rem 0 1rem"
              color="protBlack.100"
            >
              Or use the filters below to find a set of papers that match:
            </Text>

            <form>
              <Flex
                background="protGray.500"
                borderRadius="20px"
                height="100vh"
                flexDirection="column"
                justifyContent="space-between"
                padding="2.25rem 1rem"
              >
                <SimpleGrid
                  columns={2}
                  spacing="1rem 1.75rem"
                  width="100%"
                  height="90%"
                >
                  <GridItem
                    background="protGray.100"
                    rowSpan={2}
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.100"
                      alignSelf="center"
                      marginBottom="2rem"
                    >
                      Paper metadata
                    </Text>

                    <FormControl marginBottom="1.5rem">
                      <FormLabel
                        fontSize="md"
                        color="protBlack.100"
                      >
                        Terms
                      </FormLabel>
                      <Input
                        placeholder="E.g.: gene, insulin"
                        _placeholder={{
                          color: 'protBlue.900',
                          fontSize: 'sm',
                        }}
                        background="protGray.500"
                        color="protBlack.100"
                        borderRadius="8px"
                      />
                    </FormControl>

                    <Flex
                      marginBottom="1rem"
                      justifyContent="space-between"
                    >
                      <FormControl marginRight="1rem">
                        <FormLabel
                          fontSize="md"
                          color="protBlack.100"
                        >
                          Last author
                        </FormLabel>
                        <Input
                          placeholder="E.g.: Doe, J."
                          _placeholder={{
                            color: 'protBlue.900',
                            fontSize: 'sm',
                          }}
                          background="protGray.500"
                          color="protBlack.100"
                          borderRadius="8px"
                        />
                      </FormControl>
                      <FormControl width="60%">
                        <FormLabel
                          fontSize="md"
                          htmlFor="language"
                          color="protBlack.100"
                        >
                          Language
                        </FormLabel>
                        <Select
                          id="language"
                          placeholder="Choose language"
                          color="protBlack.100"
                          fontSize="sm"
                          background="protGray.500"
                          borderRadius="8px"
                          icon={<TriangleDownIcon />}
                          iconColor="protBlue.900"
                          iconSize="md"
                        >
                          {languages.map((language) => (
                            <option
                              value={language?.toLowerCase()}
                              key={language?.toLowerCase()}
                            >
                              {language}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </Flex>

                    <Autocomplete
                      label="Journal"
                      items={journalList.items}
                      inputValue={journalList.filterText}
                      onInputChange={journalList.setFilterText}
                      loadingState={journalList.loadingState}
                      onLoadMore={journalList.loadMore}
                      placeholder="Start typing to get suggestions..."
                      placeholderProps={{
                        color: 'protBlue.900',
                        fontSize: 'sm',
                      }}
                      labelProps={{ color: 'protBlack.100', fontSize: 'md' }}
                      inputProps={{
                        background: 'protGray.500',
                        color: 'protBlack.100',
                        borderRadius: '8px',
                      }}
                    >
                      {(item) => (
                        <Item key={item.journal?.toLowerCase()}>
                          {item.journal}
                        </Item>
                      )}
                    </Autocomplete>
                    <DateRangePicker
                      label="Date and time range"
                      minValue={today(getLocalTimeZone())}
                      defaultValue={{
                        start: now(getLocalTimeZone()),
                        end: now(getLocalTimeZone()).add({ weeks: 1 }),
                      }}
                    />
                  </GridItem>

                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem"
                  ></GridItem>
                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem"
                  ></GridItem>
                </SimpleGrid>

                <Button
                  type="submit"
                  width="10%"
                  alignSelf="center"
                  color="protBlack.100"
                  borderRadius="8px"
                  fontWeight="regular"
                  background="protBlue.300"
                  _hover={{
                    background: 'protBlue.veryLightHover',
                  }}
                >
                  Search
                </Button>
              </Flex>
            </form>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}

export async function getStaticProps() {
  const data = await prisma.metadataPub.findMany({
    distinct: ['languagePub'],
    select: { languagePub: true },
    where: {
      NOT: [{ languagePub: null }],
    },
  });

  const languages: LanguagePub[] = data.map(
    (languagePub) => languagePub.languagePub
  );

  return { props: { languages } };
}

export default Home;
