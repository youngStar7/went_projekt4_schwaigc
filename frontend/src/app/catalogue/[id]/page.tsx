import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ProductDetailClient from './ProductDetailClient';
import { getProductById, getProducts } from '@/lib/products';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product?.name ?? 'Produkt' };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const [product, related] = await Promise.all([
    getProductById(id),
    getProducts('de', 1, 20),
  ]);

  if (!product) notFound();

  const relatedProducts = related.filter(p => p.id !== id && p.cat === product.cat).slice(0, 3);

  return (
    <>
      <div style={{ paddingTop: 68 }}>
        <ProductDetailClient product={product} related={relatedProducts} />
      </div>
      <Footer />
    </>
  );
}
