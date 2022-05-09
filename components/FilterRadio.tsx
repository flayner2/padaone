import { Radio, RadioProps } from '@chakra-ui/react';

function FilterRadio({ children, ...props }: RadioProps) {
  return (
    <Radio
      size="sm"
      borderWidth="1px"
      borderColor="black"
      background="white"
      {...props}
    >
      {children}
    </Radio>
  );
}

export default FilterRadio;
