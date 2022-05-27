import { Search2Icon, TriangleDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Select,
  SimpleGrid,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import type { InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useAsyncList } from 'react-stately';
import { Autocomplete, Item } from '../components/Autocomplete';
import DatePicker from '../components/DatePicker';
import { debounce } from '../lib/debounce';
import {
  getAllUniqueLanguages,
  getPubDateRange,
  getClassificationLayersRange,
} from '../lib/getStaticData';
import type {
  AsyncListDataDebouncedReturn,
  Journal,
  PaperTitlePMID,
  TaxonNameAndID,
} from '../lib/types';

const OFFSET_VALUE: number = 20;

function Home({
  languages,
  pubDateRange,
  classificationScores,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  const minDate = new Date(pubDateRange._min.yearPub || 1970, 0);
  const maxDate = new Date(
    pubDateRange._max.yearPub || Date.prototype.getFullYear(),
    11
  );

  const [offset, setOffset] = useState(0);
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const [allDatesChecked, setAllDatesChecked] = useState(true);
  const [minLayer1Value, setMinLayer1Value] = useState(
    classificationScores.firstLayer.min
  );
  const [maxLayer1Value, setMaxLayer1Value] = useState(
    classificationScores.firstLayer.max
  );
  const [minLayer2Value, setMinLayer2Value] = useState(
    classificationScores.secondLayer.min
  );
  const [maxLayer2Value, setMaxLayer2Value] = useState(
    classificationScores.secondLayer.max
  );

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

  let taxaList = useAsyncList<TaxonNameAndID>({
    async load({ signal, cursor, filterText }) {
      return getAsyncListDataDebounced(
        '/api/getAutocompleteTaxa?taxonName',
        signal,
        cursor,
        filterText
      );
    },
  });

  function handleAutocompleteInputChange(
    value: string,
    list: ReturnType<typeof useAsyncList>
  ) {
    setOffset(0);
    list.setFilterText(value);
  }

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
            color="protBlack.800"
            fontWeight="semibold"
            marginBottom="1rem"
          >
            Prot-DB
          </Heading>

          <Text
            marginBottom="1rem"
            textAlign="justify"
            color="protBlack.800"
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
              color="protBlack.800"
            >
              Find a specific paper by title or PMID:
            </Text>
            <Flex justifyContent="space-between">
              <Autocomplete
                label="Title"
                items={paperList.items}
                inputValue={paperList.filterText}
                onInputChange={(value) =>
                  handleAutocompleteInputChange(value, paperList)
                }
                loadingState={paperList.loadingState}
                onLoadMore={paperList.loadMore}
                button={
                  <Button
                    background="protBlue.300"
                    _hover={{
                      background: 'protBlue.veryLightHover',
                    }}
                  >
                    <Search2Icon color="protBlack.800" />
                  </Button>
                }
                placeholder="Start typing to get suggestions..."
                placeholderProps={{
                  color: 'protBlue.900',
                  fontSize: 'sm',
                }}
                labelProps={{ color: 'protBlack.800', fontSize: 'md' }}
                boxProps={{ width: '85%', marginRight: '1rem' }}
                inputProps={{
                  background: 'protGray.500',
                  color: 'protBlack.800',
                  borderRadius: '8px',
                }}
              >
                {(item) => <Item key={item.pmid}>{item.title}</Item>}
              </Autocomplete>

              <FormControl width="40%">
                <FormLabel
                  fontSize="md"
                  color="protBlack.800"
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
                      <Search2Icon color="protBlack.800" />
                    </Button>
                  </InputRightElement>
                  <Input
                    placeholder="E.g.: 123"
                    _placeholder={{
                      color: 'protBlue.900',
                      fontSize: 'sm',
                    }}
                    background="protGray.500"
                    color="protBlack.800"
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
              color="protBlack.800"
            >
              Or use the filters below to find a set of papers that match:
            </Text>

            <form>
              <Flex
                background="protGray.500"
                borderRadius="20px"
                flexDirection="column"
                justifyContent="space-between"
                padding="2.25rem 1rem"
              >
                <SimpleGrid
                  columns={2}
                  spacing="1rem 1rem"
                  width="100%"
                  height="90%"
                  marginBottom="1.5rem"
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
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Paper metadata
                    </Text>

                    <FormControl marginBottom="1.5rem">
                      <FormLabel
                        fontSize="md"
                        color="protBlack.800"
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
                        color="protBlack.800"
                        borderRadius="8px"
                      />
                    </FormControl>

                    <HStack
                      marginBottom="1.5rem"
                      justifyContent="space-between"
                    >
                      <FormControl marginRight="0.5rem">
                        <FormLabel
                          fontSize="md"
                          color="protBlack.800"
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
                          color="protBlack.800"
                          borderRadius="8px"
                        />
                      </FormControl>
                      <FormControl width="55%">
                        <FormLabel
                          fontSize="md"
                          htmlFor="language"
                          color="protBlack.800"
                        >
                          Language
                        </FormLabel>
                        <Select
                          id="language"
                          placeholder="Choose language"
                          color="protBlack.800"
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
                    </HStack>

                    <Autocomplete
                      label="Journal"
                      items={journalList.items}
                      inputValue={journalList.filterText}
                      onInputChange={(value) =>
                        handleAutocompleteInputChange(value, journalList)
                      }
                      loadingState={journalList.loadingState}
                      onLoadMore={journalList.loadMore}
                      placeholder="Start typing to get suggestions..."
                      placeholderProps={{
                        color: 'protBlue.900',
                        fontSize: 'sm',
                      }}
                      labelProps={{ color: 'protBlack.800', fontSize: 'md' }}
                      inputProps={{
                        background: 'protGray.500',
                        color: 'protBlack.800',
                        borderRadius: '8px',
                      }}
                      boxProps={{ marginBottom: '1.5rem' }}
                    >
                      {(item) => (
                        <Item key={item.journal?.toLowerCase()}>
                          {item.journal}
                        </Item>
                      )}
                    </Autocomplete>

                    <FormControl marginBottom="1.5rem">
                      <FormLabel marginBottom="1rem">
                        Publication date
                      </FormLabel>
                      <HStack>
                        <DatePicker
                          inputLabel="From"
                          selected={startDate}
                          onChange={(date: Date) => setStartDate(date)}
                          dateFormat="yyyy"
                          minDate={minDate}
                          maxDate={maxDate}
                          showYearPicker
                          disabled={allDatesChecked}
                        />

                        <DatePicker
                          inputLabel="To"
                          selected={endDate}
                          onChange={(date: Date) => setEndDate(date)}
                          dateFormat="yyyy"
                          minDate={startDate}
                          maxDate={maxDate}
                          showYearPicker
                          disabled={allDatesChecked}
                        />
                        <Checkbox
                          value="any"
                          colorScheme="blue"
                          iconColor="protGray.100"
                          alignSelf="flex-end"
                          defaultChecked
                          onChange={() => {
                            setAllDatesChecked((current) => !current);
                          }}
                        >
                          Any
                        </Checkbox>
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Number of citations</FormLabel>
                      <CheckboxGroup colorScheme="blue">
                        <HStack
                          spacing="2rem"
                          paddingLeft="1rem"
                        >
                          <Checkbox
                            value="1"
                            iconColor="protGray.100"
                          >
                            0 - 10
                          </Checkbox>
                          <Checkbox
                            value="2"
                            iconColor="protGray.100"
                          >
                            11 - 21
                          </Checkbox>
                          <Checkbox
                            value="3"
                            iconColor="protGray.100"
                          >
                            21 - 50
                          </Checkbox>
                          <Checkbox
                            value="4"
                            iconColor="protGray.100"
                          >
                            51 - 100
                          </Checkbox>
                          <Checkbox
                            value="5"
                            iconColor="protGray.100"
                          >
                            {'>'} 100
                          </Checkbox>
                        </HStack>
                      </CheckboxGroup>
                    </FormControl>
                  </GridItem>

                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem 1.5rem"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Classification scores
                    </Text>

                    <FormControl marginBottom="3rem">
                      <VStack width="100%">
                        <FormLabel
                          marginBottom="1rem"
                          alignSelf="flex-start"
                          color="protBlack.800"
                        >
                          1st Layer Probability
                        </FormLabel>
                        <RangeSlider
                          aria-label={['min', 'max']}
                          width="90%"
                          alignSelf="center"
                          min={classificationScores.firstLayer.min}
                          max={classificationScores.firstLayer.max}
                          defaultValue={[
                            classificationScores.firstLayer.min,
                            classificationScores.firstLayer.max,
                          ]}
                          onChange={([v1, v2]) => {
                            setMinLayer1Value(v1);
                            setMaxLayer1Value(v2);
                          }}
                          step={0.1}
                        >
                          <RangeSliderTrack bg="protBlue.900">
                            <RangeSliderFilledTrack bg="protBlue.100" />
                          </RangeSliderTrack>
                          <Tooltip
                            hasArrow
                            bg="protBlue.100"
                            color="white"
                            placement="bottom"
                            isOpen
                            label={`${minLayer1Value}%`}
                          >
                            <RangeSliderThumb
                              boxSize={6}
                              index={0}
                              background="protBlue.100"
                            />
                          </Tooltip>
                          <Tooltip
                            hasArrow
                            bg="protBlue.100"
                            color="white"
                            placement="bottom"
                            isOpen
                            label={`${maxLayer1Value}%`}
                          >
                            <RangeSliderThumb
                              boxSize={6}
                              index={1}
                              background="protBlue.100"
                            />
                          </Tooltip>
                        </RangeSlider>
                      </VStack>
                    </FormControl>

                    <FormControl marginBottom="1.5rem">
                      <VStack width="100%">
                        <FormLabel
                          marginBottom="1rem"
                          alignSelf="flex-start"
                          color="protBlack.800"
                        >
                          2nd Layer Probability
                        </FormLabel>
                        <RangeSlider
                          aria-label={['min', 'max']}
                          width="90%"
                          alignSelf="center"
                          min={classificationScores.secondLayer.min}
                          max={classificationScores.secondLayer.max}
                          defaultValue={[
                            classificationScores.secondLayer.min,
                            classificationScores.secondLayer.max,
                          ]}
                          onChange={([v1, v2]) => {
                            setMinLayer2Value(v1);
                            setMaxLayer2Value(v2);
                          }}
                          step={0.1}
                        >
                          <RangeSliderTrack bg="protBlue.900">
                            <RangeSliderFilledTrack bg="protBlue.100" />
                          </RangeSliderTrack>
                          <Tooltip
                            hasArrow
                            bg="protBlue.100"
                            color="white"
                            placement="bottom"
                            isOpen
                            label={`${minLayer2Value}%`}
                          >
                            <RangeSliderThumb
                              boxSize={6}
                              index={0}
                              background="protBlue.100"
                            />
                          </Tooltip>
                          <Tooltip
                            hasArrow
                            bg="protBlue.100"
                            color="white"
                            placement="bottom"
                            isOpen
                            label={`${maxLayer2Value}%`}
                          >
                            <RangeSliderThumb
                              boxSize={6}
                              index={1}
                              background="protBlue.100"
                            />
                          </Tooltip>
                        </RangeSlider>
                      </VStack>
                    </FormControl>
                  </GridItem>

                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem 1.5rem"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Taxon data
                    </Text>

                    <Autocomplete
                      label="Taxon name (or Taxon ID)"
                      items={taxaList.items}
                      inputValue={taxaList.filterText}
                      onInputChange={(value) =>
                        handleAutocompleteInputChange(value, taxaList)
                      }
                      loadingState={taxaList.loadingState}
                      onLoadMore={taxaList.loadMore}
                      placeholder="Start typing to get suggestions..."
                      placeholderProps={{
                        color: 'protBlue.900',
                        fontSize: 'sm',
                      }}
                      labelProps={{ color: 'protBlack.800', fontSize: 'md' }}
                      inputProps={{
                        background: 'protGray.500',
                        color: 'protBlack.800',
                        borderRadius: '8px',
                      }}
                      boxProps={{ marginBottom: '1rem' }}
                    >
                      {(item) => (
                        <Item key={item.taxID}>{item.orgTaxName}</Item>
                      )}
                    </Autocomplete>

                    <HStack justifyContent="space-between">
                      <FormControl marginRight="0.5rem">
                        <FormLabel
                          fontSize="md"
                          color="protBlack.800"
                        >
                          Gene ID
                        </FormLabel>
                        <Input
                          placeholder="E.g.: NP_001191615"
                          _placeholder={{
                            color: 'protBlue.900',
                            fontSize: 'sm',
                          }}
                          background="protGray.500"
                          color="protBlack.800"
                          borderRadius="8px"
                        />
                      </FormControl>

                      <Checkbox
                        value="taxonRequired"
                        colorScheme="blue"
                        iconColor="protGray.100"
                        alignSelf="flex-end"
                        defaultChecked
                        onChange={() => {
                          setAllDatesChecked((current) => !current);
                        }}
                      >
                        Required
                      </Checkbox>
                    </HStack>
                  </GridItem>
                </SimpleGrid>

                <Button
                  type="submit"
                  width="10%"
                  alignSelf="center"
                  color="protBlack.800"
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
  const languages = await getAllUniqueLanguages();
  const pubDateRange = await getPubDateRange();
  const classificationScores = await getClassificationLayersRange();

  return { props: { languages, pubDateRange, classificationScores } };
}

export default Home;
