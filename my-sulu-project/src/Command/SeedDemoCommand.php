<?php

declare(strict_types=1);

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Sulu\Article\Application\Message\ApplyWorkflowTransitionArticleMessage;
use Sulu\Article\Application\Message\CreateArticleMessage;
use Sulu\Article\Domain\Repository\ArticleRepositoryInterface;
use Sulu\Bundle\CategoryBundle\Category\CategoryManagerInterface;
use Sulu\Bundle\CategoryBundle\Entity\CategoryInterface;
use Sulu\Bundle\CategoryBundle\Exception\CategoryKeyNotFoundException;
use Sulu\Bundle\MediaBundle\Collection\Manager\CollectionManagerInterface;
use Sulu\Bundle\MediaBundle\Entity\CollectionMeta;
use Sulu\Bundle\MediaBundle\Media\Manager\MediaManagerInterface;
use Sulu\Content\Application\ContentManager\ContentManagerInterface;
use Sulu\Content\Domain\Model\DimensionContentInterface;
use Sulu\Content\Domain\Model\WorkflowInterface;
use Sulu\Content\Infrastructure\Doctrine\DimensionContentQueryEnhancer;
use Sulu\Messenger\Infrastructure\Symfony\Messenger\FlushMiddleware\EnableFlushStamp;
use Sulu\Page\Application\Message\ApplyWorkflowTransitionPageMessage;
use Sulu\Page\Application\Message\ModifyPageMessage;
use Sulu\Page\Domain\Repository\PageRepositoryInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Seeds the headless CMS with demo content for the "Mini" E-Commerce showcase:
 *   - product categories,
 *   - a media collection with one generated image per product,
 *   - >= 10 published products (article content type) with title, description,
 *     price, category and image,
 *   - homepage intro text.
 *
 * Re-running is safe: categories are matched by key, the media collection is
 * reused, and products are only created when the catalogue is not already
 * populated (override with --force).
 */
#[AsCommand(
    name: 'app:seed-demo',
    description: 'Seed demo products, categories, images and homepage content into the CMS',
)]
final class SeedDemoCommand extends Command
{
    use HandleTrait;

    private const LOCALE = 'en';
    private const USER_ID = 1;
    private const COLLECTION_TITLE = 'Product Images';

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly ArticleRepositoryInterface $articleRepository,
        private readonly PageRepositoryInterface $pageRepository,
        private readonly CategoryManagerInterface $categoryManager,
        private readonly MediaManagerInterface $mediaManager,
        private readonly CollectionManagerInterface $collectionManager,
        private readonly ContentManagerInterface $contentManager,
        private readonly EntityManagerInterface $entityManager,
    ) {
        $this->messageBus = $messageBus;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'force',
            null,
            InputOption::VALUE_NONE,
            'Create products even if the catalogue already contains items.',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Seeding demo shop content');

        // 1. Categories -------------------------------------------------------
        $io->section('Categories');
        $categories = [];
        foreach ($this->categoryDefinitions() as $key => $name) {
            $categories[$key] = $this->ensureCategory($key, $name);
            $io->writeln(\sprintf('  • %s (id %d)', $name, $categories[$key]));
        }

        // 2. Media collection -------------------------------------------------
        $io->section('Media collection');
        $collectionId = $this->ensureCollection();
        $io->writeln(\sprintf('  • "%s" (id %d)', self::COLLECTION_TITLE, $collectionId));

        // 3. Products ---------------------------------------------------------
        $io->section('Products');
        $liveCount = $this->articleRepository->countBy([
            'locale' => self::LOCALE,
            'stage' => DimensionContentInterface::STAGE_LIVE,
        ]);

        if ($liveCount >= 10 && !$input->getOption('force')) {
            $io->note(\sprintf(
                'Catalogue already has %d published products – skipping product creation. Use --force to seed anyway.',
                $liveCount,
            ));
        } else {
            foreach ($this->productDefinitions() as $product) {
                $categoryId = $categories[$product['category']];
                $mediaId = $this->createProductImage($product['title'], $product['color'], $collectionId);

                $uuid = $this->createProduct($product, $categoryId, $mediaId);
                $this->publishProduct($uuid);

                $io->writeln(\sprintf('  • %s — €%.2f (published)', $product['title'], $product['price']));
            }
        }

        // 4. Homepage intro ---------------------------------------------------
        $io->section('Homepage');
        try {
            $this->seedHomepage();
            $io->writeln('  • Homepage intro text set and published');
        } catch (\Throwable $e) {
            $io->warning('Homepage could not be updated: ' . $e->getMessage());
        }

        $io->success('Demo content seeded. Restart not required – revalidate the Next.js frontend.');

        return Command::SUCCESS;
    }

    /**
     * @return array<string, string> category key => display name
     */
    private function categoryDefinitions(): array
    {
        return [
            'electronics' => 'Electronics',
            'books' => 'Books',
            'clothing' => 'Clothing',
            'home-living' => 'Home & Living',
        ];
    }

    /**
     * @return list<array{title: string, price: float, category: string, color: array{int, int, int}, description: string, details: string}>
     */
    private function productDefinitions(): array
    {
        return [
            ['title' => 'Wireless Headphones', 'price' => 89.90, 'category' => 'electronics', 'color' => [37, 99, 235],
                'description' => 'Over-ear Bluetooth headphones with active noise cancelling and 30h battery life.',
                'details' => 'Enjoy immersive sound with deep bass and crystal-clear highs. Foldable design, USB-C fast charging and a comfortable memory-foam headband.'],
            ['title' => 'Smart Watch Series 5', 'price' => 199.00, 'category' => 'electronics', 'color' => [14, 165, 233],
                'description' => 'Fitness tracking, heart-rate monitor and always-on AMOLED display.',
                'details' => 'Track workouts, sleep and stress. Water resistant to 50m with up to 7 days of battery life and customizable watch faces.'],
            ['title' => 'Mechanical Keyboard', 'price' => 119.99, 'category' => 'electronics', 'color' => [99, 102, 241],
                'description' => 'Hot-swappable mechanical keyboard with RGB backlight and tactile switches.',
                'details' => 'A compact 75% layout with PBT keycaps, per-key RGB and a sturdy aluminium frame for a satisfying typing experience.'],
            ['title' => 'The Pragmatic Programmer', 'price' => 39.95, 'category' => 'books', 'color' => [217, 119, 6],
                'description' => 'Classic software-engineering handbook, 20th anniversary edition.',
                'details' => 'Timeless tips on writing flexible, maintainable code – from automation to pragmatic paranoia. A must-read for every developer.'],
            ['title' => 'Clean Architecture', 'price' => 34.50, 'category' => 'books', 'color' => [180, 83, 9],
                'description' => 'A craftsman\'s guide to software structure and design by Robert C. Martin.',
                'details' => 'Learn the universal rules of software architecture and how to build systems that are easy to change, test and maintain.'],
            ['title' => 'Cotton T-Shirt', 'price' => 24.90, 'category' => 'clothing', 'color' => [16, 185, 129],
                'description' => '100% organic cotton T-shirt, breathable and pre-shrunk.',
                'details' => 'A wardrobe staple in a relaxed unisex fit. Soft combed cotton, reinforced seams and available in multiple colours.'],
            ['title' => 'Denim Jacket', 'price' => 79.00, 'category' => 'clothing', 'color' => [5, 150, 105],
                'description' => 'Classic blue denim jacket with a regular fit and button front.',
                'details' => 'Durable mid-weight denim with chest and side pockets. A timeless layer that works all year round.'],
            ['title' => 'Ceramic Coffee Mug', 'price' => 14.95, 'category' => 'home-living', 'color' => [219, 39, 119],
                'description' => 'Hand-glazed 350ml ceramic mug, dishwasher and microwave safe.',
                'details' => 'Start your morning right. The thick walls keep your coffee warm and the ergonomic handle feels great in hand.'],
            ['title' => 'Scented Soy Candle', 'price' => 19.50, 'category' => 'home-living', 'color' => [190, 24, 93],
                'description' => 'Natural soy-wax candle with a warm vanilla and amber fragrance.',
                'details' => 'Up to 45 hours of clean burn time in a reusable amber glass jar. Hand-poured from 100% natural soy wax.'],
            ['title' => 'Desk Plant – Monstera', 'price' => 29.90, 'category' => 'home-living', 'color' => [22, 163, 74],
                'description' => 'Easy-care Monstera deliciosa in a minimalist ceramic pot.',
                'details' => 'Brighten up your workspace with this low-maintenance houseplant. Ships in a 12cm pot, ready to display.'],
            ['title' => 'Portable Bluetooth Speaker', 'price' => 59.99, 'category' => 'electronics', 'color' => [29, 78, 216],
                'description' => 'Waterproof speaker with 360° sound and 24h playtime.',
                'details' => 'Take your music anywhere. IPX7 waterproof, USB-C charging and the ability to pair two speakers for true stereo.'],
            ['title' => 'Cookbook: Everyday Vegan', 'price' => 27.00, 'category' => 'books', 'color' => [202, 138, 4],
                'description' => '120 quick and colourful plant-based recipes for every day.',
                'details' => 'From 15-minute weeknight dinners to weekend bakes – simple ingredients, big flavour and beautiful photography.'],
        ];
    }

    private function ensureCategory(string $key, string $name): int
    {
        try {
            return $this->categoryManager->findByKey($key)->getId();
        } catch (CategoryKeyNotFoundException) {
            $entity = $this->categoryManager->save(
                ['key' => $key, 'name' => $name],
                self::USER_ID,
                self::LOCALE,
            );

            return $entity->getId();
        }
    }

    private function ensureCollection(): int
    {
        $meta = $this->entityManager
            ->getRepository(CollectionMeta::class)
            ->findOneBy(['title' => self::COLLECTION_TITLE]);

        if (null !== $meta) {
            return $meta->getCollection()->getId();
        }

        $collection = $this->collectionManager->save(
            [
                'title' => self::COLLECTION_TITLE,
                'locale' => self::LOCALE,
                'type' => ['id' => 1],
            ],
            self::USER_ID,
        );

        return $collection->getId();
    }

    /**
     * Generates a simple branded placeholder image and stores it in the media library.
     *
     * @param array{int, int, int} $rgb
     */
    private function createProductImage(string $title, array $rgb, int $collectionId): int
    {
        $width = 600;
        $height = 400;
        $image = \imagecreatetruecolor($width, $height);

        $bg = \imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);
        $dark = \imagecolorallocate($image, (int) ($rgb[0] * 0.7), (int) ($rgb[1] * 0.7), (int) ($rgb[2] * 0.7));
        $white = \imagecolorallocate($image, 255, 255, 255);

        \imagefilledrectangle($image, 0, 0, $width, $height, $bg);
        \imagefilledrectangle($image, 0, $height - 90, $width, $height, $dark);

        // Centered product title using a built-in bitmap font.
        $font = 5;
        $textWidth = \imagefontwidth($font) * \strlen($title);
        $x = (int) (($width - $textWidth) / 2);
        \imagestring($image, $font, $x, (int) ($height / 2 - 8), $title, $white);

        $tmp = \tempnam(\sys_get_temp_dir(), 'seed') . '.png';
        \imagepng($image, $tmp);
        \imagedestroy($image);

        $slug = $this->slugify($title);
        $uploadedFile = new UploadedFile($tmp, $slug . '.png', 'image/png', null, true);

        $media = $this->mediaManager->save(
            $uploadedFile,
            [
                'title' => $title,
                'locale' => self::LOCALE,
                'collection' => $collectionId,
            ],
            self::USER_ID,
        );

        @\unlink($tmp);

        return $media->getId();
    }

    /**
     * @param array{title: string, price: float, description: string, details: string} $product
     */
    private function createProduct(array $product, int $categoryId, int $mediaId): string
    {
        $message = new CreateArticleMessage([
            'locale' => self::LOCALE,
            'template' => 'article',
            'title' => $product['title'],
            'url' => '/products/' . $this->slugify($product['title']),
            'price' => $product['price'],
            'description' => $product['description'],
            'category' => $categoryId,
            'image' => ['id' => $mediaId],
            'article' => '<p>' . $product['details'] . '</p>',
        ]);

        /** @var \Sulu\Article\Domain\Model\ArticleInterface $article */
        $article = $this->handle(new Envelope($message, [new EnableFlushStamp()]));

        return $article->getId();
    }

    private function publishProduct(string $uuid): void
    {
        $message = new ApplyWorkflowTransitionArticleMessage(
            ['uuid' => $uuid],
            self::LOCALE,
            WorkflowInterface::WORKFLOW_TRANSITION_PUBLISH,
        );

        $this->handle(new Envelope($message, [new EnableFlushStamp()]));
    }

    private function seedHomepage(): void
    {
        $page = $this->pageRepository->findOneBy(
            [
                'locale' => self::LOCALE,
                'stage' => DimensionContentInterface::STAGE_DRAFT,
            ],
            [
                PageRepositoryInterface::SELECT_PAGE_CONTENT => [
                    'selects' => [DimensionContentQueryEnhancer::GROUP_SELECT_CONTENT_ADMIN => true],
                    'dimensionAttributes' => [
                        'locale' => self::LOCALE,
                        'stage' => [DimensionContentInterface::STAGE_DRAFT, DimensionContentInterface::STAGE_LIVE],
                    ],
                ],
            ],
        );

        if (null === $page) {
            throw new \RuntimeException('No homepage page found.');
        }

        $dimensionContent = $this->contentManager->resolve($page, [
            'locale' => self::LOCALE,
            'stage' => DimensionContentInterface::STAGE_DRAFT,
        ]);
        $data = $this->contentManager->normalize($dimensionContent);

        $data['locale'] = self::LOCALE;
        $data['template'] ??= 'homepage';
        $data['article'] = <<<'HTML'
            <h2>Welcome to the Mini Shop</h2>
            <p>This is a headless e-commerce showcase: the content is managed in
            Sulu CMS and rendered by a Next.js frontend. Browse the
            <a href="/articles">products</a> to see live data served through the
            REST API.</p>
            HTML;

        $this->handle(new Envelope(
            new ModifyPageMessage(['uuid' => $page->getId()], $data),
            [new EnableFlushStamp()],
        ));

        $this->handle(new Envelope(
            new ApplyWorkflowTransitionPageMessage(
                ['uuid' => $page->getId()],
                self::LOCALE,
                WorkflowInterface::WORKFLOW_TRANSITION_PUBLISH,
            ),
            [new EnableFlushStamp()],
        ));
    }

    private function slugify(string $value): string
    {
        $value = \strtolower(\trim($value));
        $value = \preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';

        return \trim($value, '-');
    }
}
