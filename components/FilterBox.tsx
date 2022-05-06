import { Box, Text, BoxProps } from '@chakra-ui/react';

type Props = BoxProps;

function FilterBox({ title, children, ...props }: Props) {
  return (
    <Box
      height="15vh"
      bg="tomato"
      {...props}
    >
      <Text>{title}</Text>
      {children}
    </Box>
  );
}

export default FilterBox;

