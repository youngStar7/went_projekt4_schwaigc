import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import CatalogueClient from './CatalogueClient';
import { getProducts } from '@/lib/products';
import type { Metadata } from 'next';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Kollektion' };

interface Props {
  searchParams: Promise<{ cat?: string; tag?: string }>;
}

export default async function CataloguePage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const products = await getProducts('de', 1, 100);

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <CatalogueClient products={products} initialCat={cat ?? 'Alle'} />
      </div>
      <Newsletter />
      <Footer />
    </>
  );
}
