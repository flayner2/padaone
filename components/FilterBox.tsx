import { Box, BoxProps } from '@chakra-ui/react';

type Props = BoxProps;

function FilterBox({ children, ...props }: Props) {
  return (
    <Box
      bg="tomato"
      height="15vh"
      {...props}
    >
      {children}
    </Box>
  );
}

export default FilterBox;

