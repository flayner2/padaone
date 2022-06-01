import { Search2Icon, TriangleDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  GridItem,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import type { InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useAsyncList } from 'react-stately';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { Autocomplete, Item } from '../components/Autocomplete';
import DatePicker from '../components/DatePicker';
import { debounce } from '../lib/debounce';
import {
  getAllUniqueLanguages,
  getClassificationLayersRange,
  getPubDateRange,
} from '../lib/getStaticData';
import type {
  AsyncListDataDebouncedReturn,
  Journal,
  PaperTitlePMID,
  TaxonNameAndID,
  PaperTitleFormValue,
  PaperPMIDFormValue,
  PaperFiltersFormValues,
} from '../lib/types';
import { getPaper } from './api/getPaper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';

const OFFSET_VALUE: number = 20;

function Home({
  languages,
  pubDateRange,
  classificationScores,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  // Routing
  const router = useRouter();

  // State
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

  // Async lists
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
      return await getAsyncListDataDebounced(
        '/api/getAutocompletePapers?paperTitle',
        signal,
        cursor,
        filterText
      );
    },
  });

  let journalList = useAsyncList<Journal>({
    async load({ signal, cursor, filterText }) {
      return await getAsyncListDataDebounced(
        '/api/getAutocompleteJournals?journalName',
        signal,
        cursor,
        filterText
      );
    },
  });

  let taxaList = useAsyncList<TaxonNameAndID>({
    async load({ signal, cursor, filterText }) {
      return await getAsyncListDataDebounced(
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

  // Hook-form
  const paperTitleValidationSchema = yup.object({
    paperTitle: yup
      .string()
      .required('Please start typing and select one of the suggestions.'),
  });

  const paperPMIDValidationSchema = yup.object({
    paperPMID: yup
      .string()
      .matches(/([0-9])/, 'Please, only enter numbers on this field.')
      .required('Please enter a valid PMID.')
      .test(
        'pmid-exists',
        'PMID not found',
        async (value) =>
          value && (await axios.get(`/api/getPaper?pmid=${value}`)).data && true
      ),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const {
    handleSubmit: paperTitleHandleSubmit,
    control: paperTitleControl,
    formState: { errors: paperTitleErrors },
  } = useForm<PaperTitleFormValue>({
    resolver: yupResolver(paperTitleValidationSchema),
    reValidateMode: 'onSubmit',
  });

  const {
    handleSubmit: paperPMIDHandleSubmit,
    register: paperPMIDRegister,
    formState: { errors: paperPMIDErrors },
  } = useForm<PaperPMIDFormValue>({
    resolver: yupResolver(paperPMIDValidationSchema),
    reValidateMode: 'onSubmit',
  });

  const onSubmitPaperTitleOrPMID: SubmitHandler<
    PaperTitleFormValue | PaperPMIDFormValue
  > = (data, event) => {
    event?.preventDefault();

    let selectedPMID;

    if ('paperTitle' in data) {
      selectedPMID = parseInt(data.paperTitle);
    } else {
      selectedPMID = parseInt(data.paperPMID);
    }

    router.push(`/paper/${selectedPMID}`);
  };

  return (
    <Flex justifyContent="center">
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
                color: 'protBlue.lightHover',
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
                color: 'protBlue.lightHover',
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
            <HStack
              width="100%"
              spacing="0.5rem"
            >
              <form
                style={{ width: '100%', alignSelf: 'flex-start' }}
                onSubmit={paperTitleHandleSubmit(onSubmitPaperTitleOrPMID)}
              >
                <FormControl isInvalid={paperTitleErrors.paperTitle && true}>
                  <FormLabel
                    color="protBlack.800"
                    fontSize="md"
                    htmlFor="paperTitle"
                  >
                    Title
                  </FormLabel>
                  <Controller
                    control={paperTitleControl}
                    name="paperTitle"
                    render={({ field: { onChange, onBlur } }) => (
                      <Autocomplete
                        onBlur={onBlur}
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
                            type="submit"
                          >
                            <Search2Icon color="protBlack.800" />
                          </Button>
                        }
                        placeholder="Start typing to get suggestions..."
                        placeholderProps={{
                          color: 'protBlue.900',
                          fontSize: 'sm',
                        }}
                        boxProps={{ width: '100%' }}
                        inputProps={{
                          background: 'protGray.500',
                          color: 'protBlack.800',
                          borderRadius: '8px',
                          id: 'paperTitle',
                        }}
                        onSelectionChange={(value) => {
                          paperList.setSelectedKeys(new Set([value]));
                          onChange(value);
                        }}
                        selectedKeys={paperList.selectedKeys}
                        selectionMode="single"
                      >
                        {(item) => <Item key={item.pmid}>{item.title}</Item>}
                      </Autocomplete>
                    )}
                  />
                  <FormErrorMessage>
                    {paperTitleErrors.paperTitle?.message}
                  </FormErrorMessage>
                </FormControl>
              </form>

              <form
                style={{ width: '50%', alignSelf: 'flex-start' }}
                onSubmit={paperPMIDHandleSubmit(onSubmitPaperTitleOrPMID)}
              >
                <FormControl isInvalid={paperPMIDErrors.paperPMID && true}>
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
                        type="submit"
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
                      {...paperPMIDRegister('paperPMID', {
                        required: true,
                      })}
                    />
                  </InputGroup>
                  <FormErrorMessage>
                    {paperPMIDErrors.paperPMID?.message}
                  </FormErrorMessage>
                </FormControl>
              </form>
            </HStack>
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
                        htmlFor="paperTerms"
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
                        id="paperTerms"
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
                          htmlFor="lastAuthor"
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
                          id="lastAuthor"
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

                    <FormControl marginBottom="1.5rem">
                      <FormLabel
                        color="protBlack.800"
                        fontSize="md"
                        htmlFor="journalName"
                      >
                        Journal
                      </FormLabel>
                      <Autocomplete
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
                        inputProps={{
                          background: 'protGray.500',
                          color: 'protBlack.800',
                          borderRadius: '8px',
                          id: 'journalName',
                        }}
                        boxProps={{
                          width: '100%',
                        }}
                      >
                        {(item) => (
                          <Item key={item.journal?.toLowerCase()}>
                            {item.journal}
                          </Item>
                        )}
                      </Autocomplete>
                    </FormControl>

                    <FormControl marginBottom="1.5rem">
                      <FormLabel
                        marginBottom="1rem"
                        htmlFor="startDate"
                      >
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
                          id="startDate"
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
                      <FormLabel htmlFor="citations-1">
                        Number of citations
                      </FormLabel>
                      <CheckboxGroup
                        colorScheme="blue"
                        defaultValue={['1', '2', '3', '4', '5']}
                      >
                        <HStack
                          spacing="2rem"
                          paddingLeft="1rem"
                        >
                          <Checkbox
                            id="citations-1"
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
                          htmlFor="firstLayer"
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
                          id="firstLayer"
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
                          htmlFor="secondLayer"
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
                          id="secondLayer"
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

                    <FormControl marginBottom="1rem">
                      <FormLabel
                        color="protBlack.800"
                        fontSize="md"
                        htmlFor="taxonName"
                      >
                        Taxon Name {'(or Taxon ID)'}
                      </FormLabel>
                      <Autocomplete
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
                        inputProps={{
                          background: 'protGray.500',
                          color: 'protBlack.800',
                          borderRadius: '8px',
                          id: 'taxonName',
                        }}
                        boxProps={{ width: '100%' }}
                      >
                        {(item) => (
                          <Item key={item.taxID}>{item.orgTaxName}</Item>
                        )}
                      </Autocomplete>
                    </FormControl>

                    <HStack justifyContent="space-between">
                      <FormControl marginRight="0.5rem">
                        <FormLabel
                          fontSize="md"
                          color="protBlack.800"
                          htmlFor="geneID"
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
                          id="geneID"
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
