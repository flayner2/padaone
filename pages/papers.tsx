import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type {
  AsyncListDataDebouncedReturn,
  TablePaperInfo,
} from '../lib/types';
import { debounce } from '../lib/debounce';
import { useAsyncList } from 'react-stately';

const OFFSET_VALUE: number = 20;

function Papers() {
  const router = useRouter();
  const queryString = decodeURIComponent(
    router.asPath.replace(/^\/papers\?/, '')
  );
  const [offset, setOffset] = useState(0);

  // Async lists
  async function getAsyncListDataDebounced<T>(
    queryUrl: string,
    signal: AbortSignal,
    cursor: string | undefined,
    filterText: string | undefined
  ): Promise<AsyncListDataDebouncedReturn<T>> {
    const [debouncedRequest] = debounce(async (signal, cursor, filterText) => {
      let res = await axios.get(cursor || `${queryUrl}?${filterText}`, {
        signal,
      });

      return res.data;
    }, 0);

    let data = await debouncedRequest(signal, cursor, filterText);

    setOffset((previousOffset) => previousOffset + OFFSET_VALUE);

    return {
      items: data,
      cursor: `${queryUrl}?${filterText}&offset=${offset}`,
    };
  }

  let paperList = useAsyncList<TablePaperInfo>({
    async load({ signal, cursor }) {
      return await getAsyncListDataDebounced(
        '/api/papers',
        signal,
        cursor,
        queryString
      );
    },
  });

  return (
    <div>
      {paperList.items.map((value) => (
        <p key={value.pmid}>{value.title}</p>
      ))}
    </div>
  );
}

export default Papers;
