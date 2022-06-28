import { Flex, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head';

function Help() {
  return (
    <>
      <Head>
        <title>PADA-One | Help</title>
        <meta
          name="description"
          content="A database that hosts scientific papers predicted to describe protective antigens (PAgs) from a variety of organisms."
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <Flex justifyContent="center">
        <Flex
          minHeight="100vh"
          width="100%"
          padding="3rem 6rem"
          flex={1}
          flexDirection="column"
          justifyContent="space-betwen"
        >
          <Heading
            as="h1"
            size="lg"
            color="protBlack.800"
            fontWeight="semibold"
            marginBottom="1rem"
          >
            Help
          </Heading>
          <Text
            textAlign="justify"
            color="protBlack.800"
            marginBottom="0.5rem"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            vitae massa auctor, luctus libero vel, tincidunt odio. Maecenas
            feugiat ex nec condimentum pharetra. Nunc nec mauris iaculis nulla
            pharetra laoreet non sed ipsum. Donec vehicula dolor sed est tempor
            ultrices. Praesent hendrerit orci et nibh faucibus auctor. Morbi nec
            pulvinar enim. Aenean sit amet dapibus eros. Proin non velit ac nibh
            pharetra consectetur vel quis eros. Maecenas dictum libero nec
            mollis consequat. Aenean ac nunc arcu. Aliquam quis venenatis justo,
            vel consectetur massa. Fusce vitae ex dapibus, rutrum dui quis,
            iaculis ligula. Mauris ac accumsan enim. Vivamus tempor imperdiet
            ipsum. Maecenas erat odio, facilisis eu nibh quis, finibus tempor
            est.
          </Text>
          <Text
            textAlign="justify"
            color="protBlack.800"
            marginBottom="0.5rem"
          >
            Vivamus ac purus sed eros ultrices hendrerit eu sed massa. Morbi
            viverra, turpis vitae mattis vestibulum, velit nulla dignissim
            tellus, sed fermentum orci mauris ac dolor. Suspendisse potenti. Sed
            dictum, dolor at vehicula dapibus, tellus lectus volutpat neque, non
            placerat ligula lorem vel risus. Sed sodales leo et imperdiet
            placerat. Integer in iaculis ante. Integer dictum a neque malesuada
            ornare. Suspendisse potenti. Aliquam erat volutpat.
          </Text>
          <Text
            textAlign="justify"
            color="protBlack.800"
            marginBottom="0.5rem"
          >
            Pellentesque hendrerit, mauris non volutpat sollicitudin, sapien sem
            congue justo, elementum congue augue sem a odio. Pellentesque
            habitant morbi tristique senectus et netus et malesuada fames ac
            turpis egestas. Aenean luctus, felis non fringilla auctor, sem lacus
            ultrices felis, finibus laoreet lectus nulla sit amet lacus. Cras
            pretium imperdiet leo vel tempor. Nunc mollis porttitor libero nec
            sollicitudin. Nam iaculis nunc at nulla ullamcorper euismod. Mauris
            tristique vitae mi nec mollis. Suspendisse pretium tempus velit, in
            convallis velit. Cras efficitur dapibus enim vitae varius. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et
            erat ut ex mattis posuere. Suspendisse potenti. Nunc a ex vitae
            magna consequat dignissim vitae nec justo. In elementum dignissim
            sapien. Sed iaculis consectetur libero sed pulvinar. Ut ipsum
            tortor, dignissim a nisi in, aliquam tristique felis.
          </Text>
          <Text
            textAlign="justify"
            color="protBlack.800"
            marginBottom="0.5rem"
          >
            Fusce non dui blandit diam placerat auctor vulputate eu nulla. Donec
            auctor turpis ac sapien vehicula, et consequat enim viverra.
            Pellentesque nisi tellus, malesuada a risus nec, auctor lacinia
            orci. Donec cursus velit sit amet lacus convallis lacinia. Fusce
            nulla nunc, dapibus id lacinia at, porttitor sit amet dui. Proin
            efficitur eros at eleifend aliquam. Orci varius natoque penatibus et
            magnis dis parturient montes, nascetur ridiculus mus. Vivamus urna
            ex, pellentesque quis ante blandit, accumsan blandit augue. Nam
            suscipit quis risus volutpat vehicula. Etiam aliquet, quam eu luctus
            hendrerit, orci ex posuere felis, quis semper odio enim id neque.
            Vivamus dapibus turpis at lectus eleifend, quis ornare odio
            tincidunt.
          </Text>
          <Text
            textAlign="justify"
            color="protBlack.800"
            marginBottom="0.5rem"
          >
            Nulla viverra commodo viverra. Sed ut diam egestas, sollicitudin
            ipsum et, scelerisque massa. Sed ultricies, nibh sit amet cursus
            tristique, nunc eros congue neque, ut porta massa erat id elit.
            Morbi ornare, leo vel maximus hendrerit, tellus magna sodales ipsum,
            quis pharetra nisi odio at est. Praesent velit dui, tempus nec
            aliquam sit amet, dictum non massa. Quisque vel metus nulla. Mauris
            viverra, tortor nec dapibus feugiat, nisi leo tempus quam, sed
            pharetra felis sem sed arcu. Nunc vestibulum elit mi, ac tincidunt
            nisi suscipit pretium. In non quam tincidunt, finibus felis a,
            scelerisque sapien. Cras egestas mauris et eros fringilla aliquet.
            Donec fringilla odio quis felis scelerisque fermentum. Maecenas
            commodo, nibh placerat congue interdum, nibh felis ornare purus, in
            accumsan est dui at metus. Sed sit amet luctus quam. In lacinia nec
            velit ac euismod.
          </Text>
        </Flex>
      </Flex>
    </>
  );
}

export default Help;
