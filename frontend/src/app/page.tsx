import Hero from '@/components/Hero';
import Banner from '@/components/Banner';
import Bestsellers from '@/components/Bestsellers';
import Categories from '@/components/Categories';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { getBestsellers } from '@/lib/products';

export default async function HomePage() {
  const bestsellers = await getBestsellers('de');

  return (
    <>
      <Hero />
      <Banner />
      <Bestsellers products={bestsellers} />
      <Categories />
      <Newsletter />
      <Footer />
    </>
  );
}
