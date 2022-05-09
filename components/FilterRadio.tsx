import { Radio, RadioProps } from '@chakra-ui/react';

function FilterRadio({ children, ...props }: RadioProps) {
  return (
    <Radio
      size="sm"
      borderWidth="1px"
      borderColor="black"
      background="white"
      colorScheme="green"
      {...props}
    >
      {children}
    </Radio>
  );
}

export default FilterRadio;
