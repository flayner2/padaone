import {
  Flex,
  Heading,
  Box,
  Th,
  Td,
  Table,
  Tbody,
  Thead,
  Tr,
} from '@chakra-ui/react';

function Contact() {
  return (
    <>
      <Flex justifyContent="center">
        <Flex
          minHeight="75.5vh"
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
            marginBottom="1.5rem"
          >
            Contact
          </Heading>

          <Box
            overflowX="auto"
            width="100%"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>E-mail</Th>
                  <Th>Department</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Francisco Lobo</Td>
                  <Td>franciscolobo@gmail.com</Td>
                  <Td>
                    Laboratory of Algorithms in Biology (LAB) - Institute of
                    Biological Sciences (UFMG)
                  </Td>
                </Tr>
                <Tr>
                  <Td>Igor Lobo</Td>
                  <Td>lobo.ikc@gmail.com</Td>
                  <Td>
                    Laboratory of Algorithms in Biology (LAB) - Institute of
                    Biological Sciences (UFMG)
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </Flex>
    </>
  );
}

export default Contact;
