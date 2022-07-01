import { Flex, Heading, Divider } from '@chakra-ui/react';
import Head from 'next/head';
import CustomImage from '../../components/CustomImage';
import results1 from '../../public/help/results_1.svg';
import results2 from '../../public/help/results_2.svg';

function ResultsHelp() {
  return (
    <>
      <Head>
        <title>PADA-One | Help - Results Page</title>
        <meta
          name="description"
          content="A database that hosts scientific papers predicted to describe protective antigens (PAgs) from a variety of organisms."
        />
        <link
          rel="icon"
          href="/logo.png"
        />
      </Head>

      <Flex justifyContent="center">
        <Flex
          minHeight="100vh"
          width="100%"
          padding="3rem 6rem"
          flex={1}
          flexDirection="column"
          justifyContent="space-betwen"
        >
          <Heading
            as="h1"
            size="lg"
            color="protBlack.800"
            fontWeight="semibold"
            marginBottom="1rem"
          >
            Help - Results Page
          </Heading>
          <Divider marginBottom="1.5rem" />
          <Heading
            as="h2"
            size="md"
            color="protBlack.800"
            fontWeight="medium"
            marginBottom="1rem"
          >
            Results Table
          </Heading>
          <CustomImage
            src={results1}
            boxSize="100%"
            alt="Results page help showing the usage of the results table"
          />
          <Divider
            marginBottom="1.5rem"
            marginTop="1rem"
          />
          <Heading
            as="h2"
            size="md"
            color="protBlack.800"
            fontWeight="medium"
            marginBottom="1rem"
          >
            Article Page
          </Heading>
          <CustomImage
            src={results2}
            boxSize="100%"
            alt="Results page help showing the individual article page"
          />
        </Flex>
      </Flex>
    </>
  );
}

export default ResultsHelp;
