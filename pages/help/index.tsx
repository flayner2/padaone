import { Flex, Heading, Divider } from '@chakra-ui/react';
import Head from 'next/head';
import CustomImage from '../../components/CustomImage';
import home1 from '../../public/help/home_1.svg';
import home2 from '../../public/help/home_2.svg';
import home3 from '../../public/help/home_3.svg';

function Help() {
  return (
    <>
      <Head>
        <title>PADA-One | Help - Home Page</title>
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
            Help - Home Page
          </Heading>
          <Divider marginBottom="1.5rem" />
          <Heading
            as="h2"
            size="md"
            color="protBlack.800"
            fontWeight="medium"
            marginBottom="1rem"
          >
            Main Filters and Navigation
          </Heading>
          <CustomImage
            src={home1}
            boxSize="100%"
            alt="Home page help showing the usage of the main filters and the navigation bar"
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
            Advanced Filters
          </Heading>
          <CustomImage
            src={home2}
            boxSize="100%"
            alt="Home page help showing the usage of the advanced filters"
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
            Find a Specific Paper
          </Heading>
          <CustomImage
            src={home3}
            boxSize="100%"
            alt="Home page help showing the usage of the input boxes to find a specific paper"
          />
        </Flex>
      </Flex>
    </>
  );
}

export default Help;
