import Hero from '@/components/Hero';
import Banner from '@/components/Banner';
import Bestsellers from '@/components/Bestsellers';
import Categories from '@/components/Categories';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import { getProducts } from '@/lib/products';

export default async function HomePage() {
  const products = await getProducts('de', 1, 12);

  return (
    <>
      <Hero />
      <Banner />
      <Bestsellers products={products} />
      <Categories />
      <Newsletter />
      <Footer />
    </>
  );
}
