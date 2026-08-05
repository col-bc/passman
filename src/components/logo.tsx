'use client';

import { Box, Flex, Heading, Link } from '@chakra-ui/react';
import { TbPacman, TbPassword } from 'react-icons/tb';

function Logo({ asLink = false, href = '/' }) {
  const content = (
    <Box
      as="div"
      display="inline-flex"
      alignItems="center"
      gap={1}
      bg="yellow.solid"
      py={1.5}
      px={3}
      rounded="full"
      color={{
        _dark: 'fg.inverted',
        _light: 'fg',
      }}
      fontWeight="semibold"
      fontSize="lg"
    >
      <Flex as="span" alignItems="center">
        <TbPacman size={20} />
        <TbPassword size={16} />
      </Flex>
      <Heading as="span" fontSize="lg" fontWeight="semibold" mx={1.5} display={{ base: 'none', sm: 'inline' }}>
        Passman
      </Heading>
    </Box>
  );

  if (asLink) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default Logo;
