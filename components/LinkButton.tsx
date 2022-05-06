import Link, { LinkProps } from 'next/link';
import { Button, ButtonProps } from '@chakra-ui/react';

type Props = ButtonProps & LinkProps;

function LinkButton({ href, children, ...props }: Props) {
  return (
    <Link href={href}>
      <Button
        as="a"
        cursor="pointer"
        {...props}
      >
        {children}
      </Button>
    </Link>
  );
}

export default LinkButton;
