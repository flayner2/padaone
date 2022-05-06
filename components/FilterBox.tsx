import { Box, Text, BoxProps } from '@chakra-ui/react';

type Props = BoxProps;

function FilterBox({ title, children, ...props }: Props) {
  return (
    <Box
      height="15vh"
      bg="tomato"
      {...props}
    >
      <Text
        fontSize="14px"
        lineHeight="16px"
        color="#1e6ea6"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

export default FilterBox;

