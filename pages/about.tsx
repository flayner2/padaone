import { Divider, Flex, Heading, Text, chakra } from '@chakra-ui/react';
import CustomImage from '../components/CustomImage';
import about1 from '../public/about/about_1.svg';
import about2 from '../public/about/about_2.svg';
import about3 from '../public/about/about_3.svg';
import about4 from '../public/about/about_4.svg';

function About() {
  return (
    <>
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
            color="protBlack.800"
            fontWeight="semibold"
            marginBottom="1rem"
          >
            About
          </Heading>
          <Divider marginBottom="1.5rem" />
          <Heading
            as="h2"
            fontSize="lg"
            color="protBlack.800"
            fontWeight="semibold"
            textAlign="justify"
            marginBottom="1rem"
          >
            Development of the predictor of PAg-related articles (1st layer)
          </Heading>
          <Text
            textAlign="justify"
            color="protBlack.800"
            fontSize="md"
            marginBottom="3rem"
          >
            Firstly, we obtained article titles from databases describing
            protective antigens (PAgs) and from Immune Epitope Database (IEDB){' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (A)
            </chakra.span>
            . Then, 50 PAg-related and 50 IEDB titles were set apart to
            constitute our validation dataset{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (B)
            </chakra.span>
            . After setting apart these papers, corpora studies were performed
            to analyze the most frequent terms, as shown in{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              C
            </chakra.span>
            . Afterwards, we splitted PAg-related and IEDB titles in two
            datasets: 75% for training and 25% for testing{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (D)
            </chakra.span>
            . The training of the Logistic Regression model with LASSO (Least
            Absolute Shrinkage and Selection Operator) regularization was
            performed using &ldquo;binomial&rdquo; as the built-in family and
            10-fold cross-validation. 75% of the original dataset was used for
            this step{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (E)
            </chakra.span>
            . The classifier performance was measured using the testing dataset,
            composed of 25% of the original dataset{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (F)
            </chakra.span>
            . Sensitivity, specificity and the ROC (Receiver Operating
            Characteristic) curve were used as evaluation metrics. Finally,
            validation dataset was used to evaluate the classifier performance
            in a real scenario of literature curation{' '}
            <chakra.span
              fontWeight="semibold"
              color="protBlac.800"
            >
              (G)
            </chakra.span>
            .
          </Text>
          <CustomImage
            src={about1}
            boxSize="100%"
            alt="Image showing the workflow for the first layer of the classifier."
          />

          <Text
            textAlign="justify"
            color="protBlack.800"
            fontSize="md"
            marginBottom="3rem"
            marginTop="3rem"
          >
            Regarding the corpora studies results, the following figure presents
            a wordcloud of the most frequent terms in the paper titles from each
            group of papers (left). Then, the ROC curve, showing an AUC of 0.940
            and the most important terms used by the model for classification
            (right).
          </Text>
          <CustomImage
            src={about2}
            boxSize="100%"
            alt="Image showing the wordcloud of the most frequent terms in the paper titles from the corpora studies results."
          />

          <Text
            textAlign="justify"
            color="protBlack.800"
            fontSize="md"
            marginBottom="3rem"
            marginTop="3rem"
          >
            Once the 1st layer predictor was trained, it was tested using papers
            from PubMed, from 1983 until June 2021. Based on the PAgs-related
            (positive class) and IEDB (negative class) papers we previously set
            apart, we observed that great probabilities were assigned to the
            majority of the positive ones. In the image below, we can even note
            that the probability of 77.25% is able to effectively separate all
            the negative hold-out examples from the PAgs-related ones. Asterisks
            mean the titles of PAg-related (green) and IEDB (red) articles that
            were previously set aside.
          </Text>
          <CustomImage
            src={about3}
            boxSize="100%"
            alt="Image showing the distribution of the probabilities of the first layer prediction."
          />

          <Text
            textAlign="justify"
            color="protBlack.800"
            fontSize="md"
            marginBottom="3rem"
            marginTop="3rem"
          >
            Even after a good performance of our 1st layer model, we observed a
            number of IEDB papers well classified in the results. Then, an
            additional layer of classification was developed to reduce the
            number of false positive papers classified in the first one. To
            train and test the second logistic regression-based model, 120
            PAg-related instances, were arbitrarily selected as the positive
            class. As negative examples, 120 false positives, to which were
            assigned probabilities greater than 80%, were arbitrarily chosen
            from the first layer output. Titles and abstracts pre-processing,
            training and test and performance evaluation were performed
            following the same steps for the first layer classifier. Below, the
            wordclouds of the most frequent terms in the paper titles+abstracts
            from each group of papers (left). Then, the ROC curve, showing an
            AUC of 0.885 and the most important terms used by the model for
            classification (right).
          </Text>
          <CustomImage
            src={about4}
            boxSize="100%"
            alt="Image showing the results for the second layer classifier."
          />
        </Flex>
      </Flex>
    </>
  );
}

export default About;
