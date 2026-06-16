<?php

declare(strict_types=1);

namespace App\Controller\Website;

use Sulu\Article\Domain\Repository\ArticleRepositoryInterface;
use Sulu\Bundle\HeadlessBundle\Content\StructureResolverInterface;
use Sulu\Content\Application\ContentAggregator\ContentAggregatorInterface;
use Sulu\Content\Domain\Model\DimensionContentInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ArticleController
{
    public function __construct(
        private ArticleRepositoryInterface $articleRepository,
        private ContentAggregatorInterface $contentAggregator,
        private StructureResolverInterface $structureResolver,
    ) {
    }

    /**
     * GET /api/articles?locale=en&page=1&limit=20
     *
     * Returns a paginated list of published products with their
     * title, URL, price, category, image and description resolved
     * through the headless structure resolver.
     */
    public function listAction(Request $request): Response
    {
        $locale = $request->query->getString('locale', 'en');
        $page   = max(1, $request->query->getInt('page', 1));
        $limit  = min(100, max(1, $request->query->getInt('limit', 20)));

        $articles = $this->articleRepository->findBy(
            [
                'locale' => $locale,
                'stage'  => DimensionContentInterface::STAGE_LIVE,
                'page'   => $page,
                'limit'  => $limit,
            ],
            ['id' => 'desc'],
            [ArticleRepositoryInterface::GROUP_SELECT_ARTICLE_WEBSITE => true],
        );

        $total = $this->articleRepository->countBy([
            'locale' => $locale,
            'stage'  => DimensionContentInterface::STAGE_LIVE,
        ]);

        $items = [];
        foreach ($articles as $article) {
            try {
                $dimensionContent = $this->contentAggregator->aggregate(
                    $article,
                    ['locale' => $locale, 'stage' => DimensionContentInterface::STAGE_LIVE],
                );
            } catch (\Exception) {
                continue;
            }

            $items[] = $this->structureResolver->resolveProperties(
                $dimensionContent,
                [
                    'title'       => 'title',
                    'url'         => 'url',
                    'price'       => 'price',
                    'category'    => 'category',
                    'image'       => 'image',
                    'description' => 'description',
                ],
                $locale,
            );
        }

        return new JsonResponse([
            '_embedded' => ['articles' => $items],
            'total'     => $total,
            'page'      => $page,
            'limit'     => $limit,
            'pages'     => (int) \ceil($total / $limit),
        ]);
    }
}
