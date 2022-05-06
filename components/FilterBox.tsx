import { Box, BoxProps } from '@chakra-ui/react';
import styles from '../styles/FilterBox.module.css';

type Props = BoxProps;

function FilterBox({ children, ...props }: Props) {
  return (
    <Box
      className={styles.filterbox}
      {...props}
    >
      {children}
    </Box>
  );
}

export default FilterBox;

