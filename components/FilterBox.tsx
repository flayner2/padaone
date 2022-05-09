import { Text, Image, Flex, FlexProps } from '@chakra-ui/react';

interface Props {
  boxTitle?: string;
  sideImage?: string;
  imageAlt?: string;
  children?: any;
  props?: FlexProps;
}

function FilterBox({
  boxTitle,
  sideImage,
  imageAlt,
  children,
  ...props
}: Props) {
  return (
    <Flex
      height="20vh"
      bg="#f0f4f7"
      border="1px solid #92a2bc"
      borderRadius="8px"
      justifyContent="space-between"
      {...props}
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
        height="55%"
      ></Image>
      {children}
    </Flex>
  );
}

export default FilterBox;
