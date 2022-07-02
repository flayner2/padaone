import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

function Footer() {
  return (
    <Flex
      background="protGray.300"
      width="100%"
      minHeight="15vh"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Text
        fontSize="sm"
        color="protBlack.800"
      >
        Laboratório de Algoritmos em Biologia (LAB), Instituto de Ciências
        Biológicas (ICB).
      </Text>
      <Text
        fontSize="sm"
        color="protBlack.800"
      >
        Universidade Federal de Minas Gerais (UFMG), Av. Pres. Antônio Carlos,
        6627 - Pampulha, Belo Horizonte - MG, 31270-901, Brazil.
      </Text>
    </Flex>
  );
}

export default Footer;
