import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import {
  Flex,
  Text,
  HStack,
  VStack,
  Heading,
  Link,
  Divider,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { getPaper, getPaperProbability } from '../api/getPaper';
import Head from 'next/head';

function Paper({
  paper,
  paperProbability,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Flex justifyContent="center">
      <Head>
        <title>Prot DB | {paper?.title}</title>
        <meta
          name="description"
          content={`Paper title: ${paper?.title}`}
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      {/* Main wrapper */}
      <VStack
        minHeight="100vh"
        width="100vw"
        padding="3rem 8rem"
        flex={1}
        flexDirection="column"
        justifyContent="space-betwen"
        spacing="1.5rem"
      >
        {/* Top card (title, info) */}
        <HStack spacing="6rem">
          <VStack
            width="80%"
            marginTop="0.5rem"
            spacing="1rem"
            alignItems="flex-start"
            alignSelf="flex-start"
          >
            <Heading
              as="h1"
              fontWeight="regular"
              textAlign="justify"
              fontSize="3xl"
              color="protBlack.800"
            >
              {paper?.title}
            </Heading>

            <Text color="protBlack.800">{paper?.lastAuthor}</Text>

            <Text color="protBlack.800">
              PubMed:{' '}
              <Link
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper?.pmid}`}
                color="protBlue.400"
                isExternal
                _hover={{
                  textDecoration: 'none',
                  color: 'protBlue.lightHover',
                }}
              >
                {paper?.pmid} <ExternalLinkIcon />
              </Link>
            </Text>
          </VStack>

          <VStack
            background="protGray.100"
            height="100%"
            width="20%"
            spacing="0.25rem"
            borderRadius="16px"
            padding="1.5rem"
            alignItems="flex-start"
            fontSize="md"
          >
            <Text
              fontWeight="semibold"
              marginBottom="0.25rem"
              color="protBlack.800"
            >
              {paper?.journal?.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                letter.toUpperCase()
              )}
            </Text>

            <Text color="protBlack.800">{paper?.yearPub}</Text>
            <Text color="protBlack.800">Volume: {paper?.volume}</Text>
            <Text color="protBlack.800">Issue: {paper?.issue}</Text>
            <Text color="protBlack.800">Pages: {paper?.pages}</Text>
            <Text color="protBlack.800">Citations: {paper?.citations}</Text>
            <Text color="protBlack.800">Language: {paper?.languagePub}</Text>
          </VStack>
        </HStack>

        <VStack
          alignSelf="flex-start"
          alignItems="flex-start"
        >
          <Heading
            as="h2"
            fontSize="xl"
            color="protBlack.800"
          >
            Abstract
          </Heading>

          <Text
            textAlign="justify"
            color="protBlack.800"
          >
            {paper?.abstract}
          </Text>
        </VStack>

        <VStack spacing="1.25rem">
          <Heading
            as="h2"
            fontSize="xl"
            color="protBlack.800"
          >
            Probabilities
          </Heading>

          <HStack spacing="2rem">
            <VStack spacing="0.25rem">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="protBlack.800"
              >
                1st Layer
              </Text>

              <Text
                fontSize="lg"
                color="protBlack.800"
              >
                {paperProbability.probability1stLay}%
              </Text>
            </VStack>

            <VStack spacing="0.25rem">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="protBlack.800"
              >
                2nd Layer
              </Text>

              <Text
                fontSize="lg"
                color="protBlack.800"
              >
                {paperProbability.probability2ndLay}%
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <Divider
          padding="1rem 0"
          width="80%"
        />

        <VStack background="protGray.500">
          <Heading
            as="h2"
            fontSize="xl"
            color="protBlack.800"
          >
            Taxonomic information
          </Heading>
        </VStack>
      </VStack>
    </Flex>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { pmid: rawPmid } = context.query;
  const pmid = parseInt(
    rawPmid ? (Array.isArray(rawPmid) ? rawPmid[0] : rawPmid) : '0'
  );

  const paper = await getPaper(pmid);
  const paperProbability = await getPaperProbability(pmid);

  return {
    props: {
      paper,
      paperProbability,
    },
  };
}

export default Paper;
