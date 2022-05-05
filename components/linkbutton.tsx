import Link, { LinkProps } from 'next/link';
import { Button, ButtonProps } from '@chakra-ui/react';

type Props = ButtonProps & LinkProps;

const LinkButton = ({ href, children, ...props }: Props) => (
  <Link href={href}>
    <Button as="a" cursor="pointer" {...props}>
      {children}
    </Button>
  </Link>
);

export default LinkButton;
