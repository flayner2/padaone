import {
  Search2Icon,
  TriangleDownIcon,
  SmallAddIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
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
  Collapse,
  useDisclosure,
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
  const [dateRangeControl, setDateRangeControl] = useState({
    minDate,
    maxDate,
    allDates: true,
  });
  const [firstLayerValue, setFirstLayerValue] = useState([
    classificationScores.firstLayer.min,
    classificationScores.firstLayer.max,
  ]);
  const [secondLayerValue, setSecondLayerValue] = useState([
    classificationScores.secondLayer.min,
    classificationScores.secondLayer.max,
  ]);

  // Chakra state
  const { isOpen: advancedIsOpen, onToggle: onAdvancedToggle } =
    useDisclosure();

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
      .required('Please enter a valid PMID.')
      .test('pmid-exists', 'PMID not found', async (value) => {
        try {
          await axios.get(`/api/getPaper?pmid=${value}`);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            if (
              error.response.status === 404 ||
              error.response.status === 500
            ) {
              return false;
            }
          }
        }
        return value ? true : false;
      })
      .matches(/([0-9])/, 'Please, only enter numbers on this field.'),
  });

  const paperFiltersValidationSchema = yup.object({
    firstLayerRange: yup
      .array(yup.number())
      .length(2)
      .required(
        'Please choose a minimum and maximum value for the first layer probability range.'
      ),
    secondLayerRange: yup
      .array(yup.number())
      .length(2)
      .required(
        'Please choose a minimum and maximum value for the second layer probability range.'
      ),
    taxon: yup.number().oneOf(
      taxaList.items.map((taxon) => taxon.taxID),
      "The chosen Taxon ID wasn't found in the database."
    ),
    geneIDs: yup.string().ensure().lowercase(),
    filters: yup.object({
      excludeHosts: yup.boolean(),
      forceGeneIDs: yup.boolean(),
    }),
    terms: yup.string().ensure().lowercase(),
    lastAuthor: yup.string().ensure().lowercase(),
    language: yup
      .string()
      .ensure()
      .oneOf(
        [...languages.map((language) => language?.toLowerCase()), ''],
        'Selected language must be none or one of the provided options.'
      )
      .lowercase(),
    journal: yup.string().ensure().lowercase(),
    publicationDate: yup.object({
      minDate: yup.date(),
      maxDate: yup.date(),
      allDates: yup.boolean(),
    }),
    citations: yup.array(yup.array(yup.number()).length(2)).length(7),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PaperFiltersFormValues>({
    resolver: yupResolver(paperFiltersValidationSchema),
    reValidateMode: 'onSubmit',
  });

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

  const onSubmitMultiFieldForm: SubmitHandler<PaperFiltersFormValues> = (
    data
  ) => {
    console.log(errors);
    console.log(data);
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
        <Box
          id="search-form"
          marginBottom="2rem"
        >
          {/* Main form */}
          <Flex
            flexDirection="column"
            justifyContent="space-between"
          >
            <Text
              fontSize="xl"
              padding="1rem 0 1rem"
              color="protBlack.800"
            >
              Use the filters below to find a set of papers that match:
            </Text>

            <form onSubmit={handleSubmit(onSubmitMultiFieldForm)}>
              <Flex
                background="protGray.500"
                borderRadius="20px"
                flexDirection="column"
                justifyContent="space-between"
                padding="2.25rem 1rem"
              >
                <SimpleGrid
                  spacing="0.5rem"
                  width="100%"
                  height="90%"
                  marginBottom={advancedIsOpen ? '0.5rem' : '1.5rem'}
                >
                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem 1.5rem"
                    gridColumn="1 / 3"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Classification scores
                    </Text>

                    <FormControl
                      marginBottom="3rem"
                      isInvalid={errors.firstLayerRange ? true : false}
                    >
                      <VStack width="100%">
                        <FormLabel
                          marginBottom="1rem"
                          alignSelf="flex-start"
                          color="protBlack.800"
                          htmlFor="firstLayer"
                        >
                          1st Layer Probability
                        </FormLabel>
                        <Controller
                          control={control}
                          name="firstLayerRange"
                          defaultValue={[
                            classificationScores.firstLayer.min,
                            classificationScores.firstLayer.max,
                          ]}
                          render={({ field: { onChange, onBlur } }) => (
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
                                setFirstLayerValue([v1, v2]);
                                onChange([v1, v2]);
                              }}
                              onBlur={onBlur}
                              step={1}
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
                                label={`${firstLayerValue[0]}%`}
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
                                label={`${firstLayerValue[1]}%`}
                              >
                                <RangeSliderThumb
                                  boxSize={6}
                                  index={1}
                                  background="protBlue.100"
                                />
                              </Tooltip>
                            </RangeSlider>
                          )}
                        />
                        {errors.firstLayerRange?.map((error, index) => (
                          <FormErrorMessage
                            key={`firstLayerRangeError${index}`}
                          >
                            {error.message}
                          </FormErrorMessage>
                        ))}
                      </VStack>
                    </FormControl>

                    <FormControl
                      marginBottom="1.5rem"
                      isInvalid={errors.secondLayerRange ? true : false}
                    >
                      <VStack width="100%">
                        <FormLabel
                          marginBottom="1rem"
                          alignSelf="flex-start"
                          color="protBlack.800"
                          htmlFor="secondLayer"
                        >
                          2nd Layer Probability
                        </FormLabel>
                        <Controller
                          control={control}
                          name="secondLayerRange"
                          defaultValue={[
                            classificationScores.secondLayer.min,
                            classificationScores.secondLayer.max,
                          ]}
                          render={({ field: { onChange, onBlur } }) => (
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
                                setSecondLayerValue([v1, v2]);
                                onChange([v1, v2]);
                              }}
                              onBlur={onBlur}
                              step={1}
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
                                label={`${secondLayerValue[0]}%`}
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
                                label={`${secondLayerValue[1]}%`}
                              >
                                <RangeSliderThumb
                                  boxSize={6}
                                  index={1}
                                  background="protBlue.100"
                                />
                              </Tooltip>
                            </RangeSlider>
                          )}
                        />
                        {errors.secondLayerRange?.map((error, index) => (
                          <FormErrorMessage
                            key={`secondLayerRangeError${index}`}
                          >
                            {error.message}
                          </FormErrorMessage>
                        ))}
                      </VStack>
                    </FormControl>
                  </GridItem>

                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem 1.5rem"
                    gridColumn="3 / 5"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Taxon data
                    </Text>

                    <FormControl
                      marginBottom="3rem"
                      isInvalid={errors.taxon ? true : false}
                    >
                      <FormLabel
                        color="protBlack.800"
                        fontSize="md"
                        htmlFor="taxonName"
                      >
                        Taxon Name {'(or Taxon ID)'}
                      </FormLabel>

                      <Controller
                        control={control}
                        name="taxon"
                        render={({ field: { onChange, onBlur } }) => (
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
                            onBlur={onBlur}
                            onSelectionChange={(item) => {
                              taxaList.setSelectedKeys(new Set([item]));
                              onChange(item);
                            }}
                          >
                            {(item) => (
                              <Item key={item.taxID}>{item.orgTaxName}</Item>
                            )}
                          </Autocomplete>
                        )}
                      />
                      <FormErrorMessage>
                        {errors.taxon?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.geneIDs ? true : false}>
                      <FormLabel
                        fontSize="md"
                        color="protBlack.800"
                        htmlFor="geneID"
                      >
                        Gene IDs
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
                        id="geneIDs"
                        {...register('geneIDs')}
                      />
                      <FormErrorMessage>
                        {errors.geneIDs?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem
                    background="protGray.100"
                    borderRadius="8px"
                    display="flex"
                    flexDirection="column"
                    padding="1rem 0.5rem 1.5rem"
                    gridColumn="2 / 4"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Filters
                    </Text>

                    <FormControl
                      isInvalid={
                        errors.filters?.excludeHosts ||
                        errors.filters?.forceGeneIDs
                          ? true
                          : false
                      }
                    >
                      <CheckboxGroup
                        colorScheme="blue"
                        defaultValue={['excludeHosts', 'forceGeneids']}
                      >
                        <VStack alignItems="flex-start">
                          <Controller
                            control={control}
                            name="filters.excludeHosts"
                            defaultValue={true}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Checkbox
                                iconColor="protGray.100"
                                value="excludeHosts"
                                onBlur={onBlur}
                                onChange={() => onChange(!value)}
                              >
                                Exclude hosts
                              </Checkbox>
                            )}
                          />
                          <FormErrorMessage>
                            {errors.filters?.excludeHosts?.message}
                          </FormErrorMessage>
                          <Controller
                            control={control}
                            name="filters.forceGeneIDs"
                            defaultValue={true}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Checkbox
                                iconColor="protGray.100"
                                value="forceGeneids"
                                onBlur={onBlur}
                                onChange={() => onChange(!value)}
                              >
                                Only papers with associated gene IDs
                              </Checkbox>
                            )}
                          />
                          <FormErrorMessage>
                            {errors.filters?.forceGeneIDs?.message}
                          </FormErrorMessage>
                        </VStack>
                      </CheckboxGroup>
                    </FormControl>
                  </GridItem>
                </SimpleGrid>

                <Collapse
                  in={advancedIsOpen}
                  animateOpacity
                >
                  <Flex
                    background="protGray.100"
                    borderRadius="8px"
                    flexDirection="column"
                    padding="1rem 0.5rem"
                    marginBottom="0.5rem"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Paper metadata
                    </Text>

                    <FormControl
                      marginBottom="1.5rem"
                      isInvalid={errors.terms ? true : false}
                    >
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
                        {...register('terms')}
                      />
                      <FormErrorMessage>
                        {errors.terms?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <HStack
                      marginBottom="1.5rem"
                      justifyContent="space-between"
                    >
                      <FormControl
                        marginRight="0.5rem"
                        isInvalid={errors.lastAuthor ? true : false}
                      >
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
                          {...register('lastAuthor')}
                        />
                        <FormErrorMessage>
                          {errors.lastAuthor?.message}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        width="55%"
                        isInvalid={errors.language ? true : false}
                      >
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
                          {...register('language')}
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
                        <FormErrorMessage>
                          {errors.language?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <FormControl
                      marginBottom="1.5rem"
                      isInvalid={errors.journal ? true : false}
                    >
                      <FormLabel
                        color="protBlack.800"
                        fontSize="md"
                        htmlFor="journalName"
                      >
                        Journal
                      </FormLabel>
                      <Controller
                        control={control}
                        name="journal"
                        render={({ field: { onChange, onBlur } }) => (
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
                            selectedKeys={journalList.selectedKeys}
                            onBlur={onBlur}
                            onSelectionChange={(item) => {
                              journalList.setSelectedKeys(new Set([item]));
                              onChange(item);
                            }}
                          >
                            {(item) => (
                              <Item key={item.journal?.toLowerCase()}>
                                {item.journal}
                              </Item>
                            )}
                          </Autocomplete>
                        )}
                      />
                      <FormErrorMessage>
                        {errors.journal?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <HStack spacing="2rem">
                      <FormControl
                        width="max-content"
                        isInvalid={errors.publicationDate ? true : false}
                      >
                        <FormLabel
                          marginBottom="1rem"
                          htmlFor="startDate"
                        >
                          Publication date
                        </FormLabel>

                        <VStack alignItems="flex-start">
                          <HStack>
                            <Controller
                              control={control}
                              name="publicationDate.minDate"
                              defaultValue={dateRangeControl.minDate}
                              render={({ field: { onChange, onBlur } }) => (
                                <DatePicker
                                  inputlabel="From"
                                  selected={dateRangeControl.minDate}
                                  onBlur={onBlur}
                                  onChange={(date: Date) => {
                                    setDateRangeControl((currentDateState) => ({
                                      ...currentDateState,
                                      minDate: date,
                                    }));
                                    onChange(date);
                                  }}
                                  dateFormat="yyyy"
                                  minDate={minDate}
                                  maxDate={maxDate}
                                  showYearPicker
                                  disabled={dateRangeControl.allDates}
                                  id="startDate"
                                />
                              )}
                            />

                            <Controller
                              control={control}
                              name="publicationDate.maxDate"
                              defaultValue={dateRangeControl.maxDate}
                              render={({ field: { onChange, onBlur } }) => (
                                <DatePicker
                                  inputlabel="To"
                                  selected={dateRangeControl.maxDate}
                                  onBlur={onBlur}
                                  onChange={(date: Date) => {
                                    setDateRangeControl((currentDateState) => ({
                                      ...currentDateState,
                                      maxDate: date,
                                    }));
                                    onChange(date);
                                  }}
                                  dateFormat="yyyy"
                                  minDate={dateRangeControl.minDate}
                                  maxDate={maxDate}
                                  showYearPicker
                                  disabled={dateRangeControl.allDates}
                                />
                              )}
                            />
                          </HStack>

                          <Controller
                            control={control}
                            name="publicationDate.allDates"
                            defaultValue={true}
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <Checkbox
                                value="any"
                                colorScheme="blue"
                                iconColor="protGray.100"
                                alignSelf="flex-end"
                                defaultChecked
                                onBlur={onBlur}
                                onChange={() => {
                                  setDateRangeControl((dateRangeState) => ({
                                    ...dateRangeState,
                                    allDates: !value,
                                  }));
                                  onChange(!value);
                                }}
                              >
                                Any
                              </Checkbox>
                            )}
                          />
                          <FormErrorMessage>
                            {errors.publicationDate?.maxDate?.message}
                          </FormErrorMessage>
                          <FormErrorMessage>
                            {errors.publicationDate?.minDate?.message}
                          </FormErrorMessage>
                          <FormErrorMessage>
                            {errors.publicationDate?.allDates?.message}
                          </FormErrorMessage>
                        </VStack>
                      </FormControl>

                      <FormControl alignSelf="center">
                        <FormLabel htmlFor="citations-1">
                          Number of citations
                        </FormLabel>
                        <CheckboxGroup
                          colorScheme="blue"
                          defaultValue={['1', '2', '3', '4', '5', '6', '7']}
                        >
                          <HStack
                            spacing="2rem"
                            paddingLeft="1rem"
                          >
                            <Controller
                              control={control}
                              name="citations.0"
                              defaultValue={[0, 10]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  id="citations-1"
                                  value="1"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [0, 10]);
                                  }}
                                >
                                  0 - 10
                                </Checkbox>
                              )}
                            />
                            <Controller
                              control={control}
                              name="citations.1"
                              defaultValue={[11, 20]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="2"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [11, 20]);
                                  }}
                                >
                                  11 - 20
                                </Checkbox>
                              )}
                            />
                            <Controller
                              control={control}
                              name="citations.2"
                              defaultValue={[21, 30]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="3"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [21, 30]);
                                  }}
                                >
                                  21 - 30
                                </Checkbox>
                              )}
                            />

                            <Controller
                              control={control}
                              name="citations.3"
                              defaultValue={[31, 40]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="4"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [31, 40]);
                                  }}
                                >
                                  31 - 40
                                </Checkbox>
                              )}
                            />
                            <Controller
                              control={control}
                              name="citations.4"
                              defaultValue={[41, 50]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="5"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [41, 50]);
                                  }}
                                >
                                  41 - 50
                                </Checkbox>
                              )}
                            />
                            <Controller
                              control={control}
                              name="citations.5"
                              defaultValue={[51, 100]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="6"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(value ? undefined : [51, 100]);
                                  }}
                                >
                                  51 - 100
                                </Checkbox>
                              )}
                            />
                            <Controller
                              control={control}
                              name="citations.6"
                              defaultValue={[100, undefined]}
                              render={({
                                field: { onChange, onBlur, value },
                              }) => (
                                <Checkbox
                                  value="7"
                                  iconColor="protGray.100"
                                  onBlur={onBlur}
                                  onChange={() => {
                                    onChange(
                                      value ? undefined : [100, undefined]
                                    );
                                  }}
                                >
                                  {'>'} 100
                                </Checkbox>
                              )}
                            />
                          </HStack>
                        </CheckboxGroup>
                      </FormControl>
                    </HStack>
                  </Flex>

                  <Flex
                    background="protGray.100"
                    borderRadius="8px"
                    flexDirection="column"
                    padding="1rem 0.5rem"
                    marginBottom="2rem"
                  >
                    <Text
                      fontSize="lg"
                      color="protBlack.800"
                      alignSelf="center"
                      marginBottom="1.5rem"
                    >
                      Find a paper
                    </Text>

                    <HStack
                      width="100%"
                      spacing="0.5rem"
                    >
                      <FormControl
                        width="100%"
                        alignSelf="flex-start"
                        isInvalid={paperTitleErrors.paperTitle ? true : false}
                      >
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
                                  onClick={paperTitleHandleSubmit(
                                    onSubmitPaperTitleOrPMID
                                  )}
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
                              {(item) => (
                                <Item key={item.pmid}>{item.title}</Item>
                              )}
                            </Autocomplete>
                          )}
                        />
                        <FormErrorMessage>
                          {paperTitleErrors.paperTitle?.message}
                        </FormErrorMessage>
                      </FormControl>

                      <FormControl
                        isInvalid={paperPMIDErrors.paperPMID ? true : false}
                        width="50%"
                        alignSelf="flex-start"
                      >
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
                              onClick={paperPMIDHandleSubmit(
                                onSubmitPaperTitleOrPMID
                              )}
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
                    </HStack>
                  </Flex>
                </Collapse>

                <HStack
                  alignSelf="center"
                  width="100%"
                  justifyContent="center"
                >
                  <Button
                    onClick={onAdvancedToggle}
                    width="10%"
                    alignSelf="center"
                    fontWeight="regular"
                    fontSize="sm"
                    background="protBlue.900"
                    color="protGray.100"
                    borderRadius="8px"
                    _hover={{
                      background: 'protBlue.mediumHover',
                    }}
                  >
                    Advanced{' '}
                    {advancedIsOpen ? (
                      <SmallCloseIcon
                        color="protGray.100"
                        boxSize="1.2rem"
                        marginLeft="0.2rem"
                      />
                    ) : (
                      <SmallAddIcon
                        color="protGray.100"
                        boxSize="1.2rem"
                        marginLeft="0.2rem"
                      />
                    )}
                  </Button>
                  <Button
                    type="submit"
                    width="10%"
                    alignSelf="center"
                    color="protBlue.900"
                    borderRadius="8px"
                    fontWeight="regular"
                    background="protBlue.300"
                    _hover={{
                      background: 'protBlue.veryLightHover',
                    }}
                  >
                    Search{' '}
                    <Search2Icon
                      color="protBlue.900"
                      marginLeft="0.5rem"
                      boxSize="0.9rem"
                    />
                  </Button>
                </HStack>
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
