import { Text, Image, VStack, HStack, StackProps } from '@chakra-ui/react';

interface Props {
  boxTitle?: string;
  sideImage?: string;
  imageAlt?: string;
  children?: any;
  props?: StackProps;
}

function FilterBox({
  boxTitle,
  sideImage,
  imageAlt,
  children,
  ...props
}: Props) {
  return (
    <VStack
      height="10.3rem"
      bg="#f0f4f7"
      border="1px solid #92a2bc"
      borderRadius="8px"
      width="100%"
      spacing="0"
      {...props}
    >
      <HStack
        justify="space-between"
        align="flex-start"
        width="100%"
        height="25%"
      >
        <Text
          fontSize="sm"
          lineHeight="16px"
          color="#1e6ea6"
          fontWeight="bold"
          padding="8px"
        >
          {boxTitle}
        </Text>
        <Image
          src={sideImage}
          alt={imageAlt}
          height="100%"
        ></Image>
      </HStack>
      {children}
    </VStack>
  );
}

export default FilterBox;
