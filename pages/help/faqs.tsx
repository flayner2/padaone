import { Flex, Heading, Divider, Text, Link } from '@chakra-ui/react';
import Head from 'next/head';

function ResultsHelp() {
  return (
    <>
      <Head>
        <title>PADA-One | Help - FAQs</title>
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
            FAQs - Frequently Asked Questions
          </Heading>
          <Divider marginBottom="1.5rem" />
          <Text
            color="protBlack.800"
            fontSize="md"
            fontWeight="semibold"
            textAlign="justify"
          >
            What do the two layers of classification mean?
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            textAlign="justify"
            marginBottom="2rem"
          >
            The first layer is based on a classification performed by a logistic
            regression model, which was trained using articles describing
            protective antigen as the target group and articles describing
            epitopes and other types of protein characterization as the
            secondary group. This database hosts only articles with the 1st
            layer of probability equal or greater than 77.25%. The second layer
            of classification is also based on a logistic regression model as a
            false-positive reduction step. This model was trained using articles
            from the target group and false positive examples from the 1st layer
            output as the secondary group. Probabilities for the second layer
            range from 0 to 100%.
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            fontWeight="semibold"
            textAlign="justify"
          >
            What are the best range of probabilities to investigate regarding
            the first and second layers?
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            textAlign="justify"
            marginBottom="2rem"
          >
            We recommend the following range of probabilities: {'>='}80% for 1st
            layer and {'>='}90% for 2nd layer (see why{' '}
            <Link
              href="/about"
              color="protBlue.400"
              _hover={{
                textDecoration: 'none',
                color: 'protBlue.lightHover',
              }}
            >
              here
            </Link>
            ).
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            fontWeight="semibold"
            textAlign="justify"
          >
            Is there any type of manual curation?
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            textAlign="justify"
            marginBottom="2rem"
          >
            All papers with probability {'>='}80% for 1st layer and {'>='}90%
            for second layer are manually curated by our team. An article is
            labeled as &apos;True positive&apos; when the antigen is
            experimentally validated and immunological protection is conferred
            at some level (e.g. diminution on pathogen burden or improvement in
            the survival rate) in an animal model, after immunization and
            subsequent challenge.
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            fontWeight="semibold"
            textAlign="justify"
          >
            Is PADA-One periodically updated? What is the current version?
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            textAlign="justify"
            marginBottom="2rem"
          >
            Sure. New papers from PubMed will be continually classified and all
            related metadata will be collected. Every update news will be
            released on our homepage. The current version embodies papers from
            1983 to June 2022.
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            fontWeight="semibold"
            textAlign="justify"
          >
            Are all articles on PADA-One from PubMed? Can I use PADA-One to
            classify my own list of papers?
          </Text>
          <Text
            color="protBlack.800"
            fontSize="md"
            textAlign="justify"
            marginBottom="2rem"
          >
            All papers hosted on PADA-One are from PubMed. The database is
            totally based on tools provided to search NCBI databases.
            Unfortunately, it is not possible to use our two-layers model to
            classify other articles yet.
          </Text>
        </Flex>
      </Flex>
    </>
  );
}

export default ResultsHelp;
