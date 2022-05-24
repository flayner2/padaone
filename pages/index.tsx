import {
  Box,
  FormControl,
  FormLabel,
  Spinner,
  Button,
  Text,
  Flex,
  Heading,
  Link,
  Input,
} from '@chakra-ui/react';
import type { MetadataPub } from '@prisma/client';
import axios from 'axios';
import Head from 'next/head';
import { debounce } from '../lib/debounce';
import { Autocomplete, Item } from '../components/Autocomplete';
import { useAsyncList } from 'react-stately';
import { useState } from 'react';
import { Search2Icon } from '@chakra-ui/icons';

const OFFSET_VALUE: number = 20;

function Home(): JSX.Element {
  const [offset, setOffset] = useState(0);

  let list = useAsyncList<MetadataPub>({
    async load({ signal, cursor, filterText }) {
      const [debouncedRequest] = debounce(
        async (signal, cursor, filterText) => {
          let res = await axios.get(
            cursor || `/api/search?paperTitle=${filterText}`,
            { signal }
          );

          return res.data;
        },
        500
      );

      let data = await debouncedRequest(signal, cursor, filterText);

      setOffset(offset + OFFSET_VALUE);

      return {
        items: data,
        cursor: `/api/search?paperTitle=${filterText}&offset=${offset}`,
      };
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
        padding="3.5rem 4.5rem"
        flex={1}
        flexDirection="column"
        justifyContent="space-betwen"
      >
        <Box>
          <Heading
            as="h1"
            size="lg"
            color="protBlack.100"
            fontWeight="semibold"
            paddingBottom="1rem"
          >
            Prot-DB
          </Heading>

          <Text
            paddingBottom="1rem"
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
        <Box id="search-form">
          <Flex flexDirection="column">
            <Text
              fontSize="xl"
              padding="0.5rem 0 1rem"
              color="protBlack.100"
            >
              Find a specific paper by title or PMID:
            </Text>
            <Flex justifyContent="space-between">
              <Autocomplete
                label="Title"
                items={list.items}
                inputValue={list.filterText}
                onInputChange={list.setFilterText}
                loadingState={list.loadingState}
                onLoadMore={list.loadMore}
                button={
                  <Button background="protBlue.300">
                    <Search2Icon color="protBlack.100" />
                  </Button>
                }
                placeholder="test"
              >
                {(item) => <Item key={item.pmid}>{item.title}</Item>}
              </Autocomplete>
              <FormControl>
                <FormLabel>PMID</FormLabel>
                <Input></Input>
              </FormControl>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Home;
