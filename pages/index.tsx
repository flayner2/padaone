import { Box, FormControl, FormLabel, Spinner } from '@chakra-ui/react';
import type { MetadataPub } from '@prisma/client';
import axios from 'axios';
import Head from 'next/head';
import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { debounce } from '../lib/debounce';
import styles from '../styles/Home.module.css';

function Home(): JSX.Element {
  const [search, setSearch] = useState('');
  const [papers, setPapers] = useState<MetadataPub[]>([]);
  const lastQuery = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(() =>
      console.log('observando...')
    );

    const ward = document.querySelector('#ward');

    if (ward) {
      intersectionObserver.observe(ward);
    }

    return () => intersectionObserver.disconnect();
  }, []);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPapers([]);
    const query = event.target.value;

    if (query) {
      const searchUrl = `/api/search?paperTitle=${query}`;
      lastQuery.current = searchUrl;
      setSearch(query);

      const [debouncedRequest] = debounce(
        async () => handleRequest(searchUrl),
        500
      );
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

      <main className={styles.main}></main>
    </div>
  );
}

export default Home;
