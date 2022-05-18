import { Box, FormControl, FormLabel, Spinner } from '@chakra-ui/react';
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
} from '@choc-ui/chakra-autocomplete';
import type { MetadataPub } from '@prisma/client';
import axios from 'axios';
import Head from 'next/head';
import { ChangeEvent, useRef, useState } from 'react';
import debounce from '../lib/debounce';
import styles from '../styles/Home.module.css';

function Home(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [papers, setPapers] = useState<MetadataPub[]>([]);
  const lastQuery = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPapers([]);
    const query = event.target.value;

    if (query) {
      const searchUrl = `/api/search?paperTitle=${query}`;
      lastQuery.current = searchUrl;
      setSearch(query);

      const debouncedRequest = debounce(async () => handleRequest(searchUrl));
      debouncedRequest();
    } else {
      setSearch('');
      setPapers([]);
    }
  }

  async function handleRequest(url: string) {
    const response = await axios.get(url);

    if (url === lastQuery.current) {
      const papers = response.data;
      setPapers(papers);
      console.log(papers);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Prot DB</title>
        <meta
          name="description"
          content="Generated by create next app"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <main className={styles.main}>
        <FormControl width="80%">
          <FormLabel>Search</FormLabel>
          <AutoComplete
            openOnFocus
            maxSuggestions={20}
            defaultValues={papers}
            emptyState={
              <Box textAlign="center">
                {inputRef?.current?.value ? (
                  <Spinner />
                ) : (
                  <Box>Start typing for suggestions</Box>
                )}
              </Box>
            }
          >
            <AutoCompleteInput
              variant="outline"
              value={search}
              onChange={handleChange}
              ref={inputRef}
            />
            <AutoCompleteList>
              {papers.map((paper) => (
                <AutoCompleteItem
                  key={paper.pmid}
                  value={paper.title}
                />
              ))}
            </AutoCompleteList>
          </AutoComplete>
        </FormControl>
      </main>
    </div>
  );
}

export default Home;
