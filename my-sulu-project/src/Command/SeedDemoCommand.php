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

#[AsCommand(
    name: 'app:seed-demo',
    description: 'Seed Noven Möbel demo content (Produkte, Kategorien, Bilder, Startseite)',
)]
final class SeedDemoCommand extends Command
{
    use HandleTrait;

    private const LOCALE = 'de';
    private const USER_ID = 1;
    private const COLLECTION_TITLE = 'Noven Produktbilder';

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
        $this->addOption('force', null, InputOption::VALUE_NONE, 'Auch anlegen, wenn bereits Produkte vorhanden sind.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Noven Shop — Demo-Inhalte werden befüllt');

        // 1. Kategorien
        $io->section('Möbelkategorien');
        $categories = [];
        foreach ($this->categoryDefinitions() as $key => $name) {
            $categories[$key] = $this->ensureCategory($key, $name);
            $io->writeln(\sprintf('  ✓ %s (ID %d)', $name, $categories[$key]));
        }

        // 2. Medien-Collection
        $io->section('Medien-Collection');
        $collectionId = $this->ensureCollection();
        $io->writeln(\sprintf('  ✓ "%s" (ID %d)', self::COLLECTION_TITLE, $collectionId));

        // 3. Produkte
        $io->section('Produkte');
        $liveCount = $this->articleRepository->countBy([
            'locale' => self::LOCALE,
            'stage' => DimensionContentInterface::STAGE_LIVE,
        ]);

        if ($liveCount >= 10 && !$input->getOption('force')) {
            $io->note(\sprintf('Bereits %d veröffentlichte Produkte vorhanden — überspringe. Mit --force erzwingen.', $liveCount));
        } else {
            foreach ($this->productDefinitions() as $product) {
                $categoryId = $categories[$product['category']];
                $mediaId = $this->createProductImage($product['title'], $product['color'], $collectionId);
                $uuid = $this->createProduct($product, $categoryId, $mediaId);
                $this->publishProduct($uuid);
                $io->writeln(\sprintf('  ✓ %s — €%.2f', $product['title'], $product['price']));
            }
        }

        // 4. Startseite
        $io->section('Startseite');
        try {
            $this->seedHomepage();
            $io->writeln('  ✓ Startseite aktualisiert und veröffentlicht');
        } catch (\Throwable $e) {
            $io->warning('Startseite konnte nicht aktualisiert werden: ' . $e->getMessage());
        }

        $io->success('Demo-Inhalte erfolgreich befüllt.');

        return Command::SUCCESS;
    }

    /** @return array<string, string> */
    private function categoryDefinitions(): array
    {
        return [
            'stuehle'  => 'Stühle',
            'tische'   => 'Tische',
            'sofas'    => 'Sofas',
            'schraenke'=> 'Schränke',
            'betten'   => 'Betten',
            'regale'   => 'Regale',
        ];
    }

    /** @return list<array{title:string,price:float,category:string,color:array{int,int,int},description:string,details:string,tag:string}> */
    private function productDefinitions(): array
    {
        return [
            // ── Stühle ──────────────────────────────────────────────────────
            [
                'title' => 'Stuhl Hans',
                'price' => 1089.00,
                'category' => 'stuehle',
                'color' => [192, 176, 160],
                'tag' => 'Bestseller',
                'description' => 'Handgefertigter Sessel mit Buchenholzgestell und hochwertigem Leinenbezug. Ergonomisch und zeitlos.',
                'details' => '<p>Der Stuhl Hans verkörpert handwerkliche Exzellenz. Das Buchenholzgestell wird in Österreich von Hand gedrechselt und in drei Schichten geölt. Der Leinenbezug stammt aus biologischem Anbau und ist strapazierfähig, atmungsaktiv und mit der Zeit immer schöner.</p><p>Maße: B 62 × T 68 × H 82 cm · Sitzhöhe 46 cm</p>',
            ],
            [
                'title' => 'Sessel Kaktus',
                'price' => 1590.00,
                'category' => 'stuehle',
                'color' => [56, 56, 48],
                'tag' => '',
                'description' => 'Loungesessel mit organischer Silhouette. Bezug aus gewobener Wolle, Gestell aus mattschwarzem Stahl.',
                'details' => '<p>Der Kaktus-Sessel verbindet skulpturalen Anspruch mit höchstem Sitzkomfort. Die geschwungene Schalenform wird von einem pulverbeschichteten Stahlgestell getragen. Der dichte Wollbezug in Antrazit ist schmutzabweisend ausgerüstet.</p><p>Maße: B 78 × T 82 × H 76 cm · Sitzhöhe 40 cm</p>',
            ],
            [
                'title' => 'Essstuhl Clara',
                'price' => 549.00,
                'category' => 'stuehle',
                'color' => [200, 184, 156],
                'tag' => 'Neu',
                'description' => 'Schlichter Essstuhl aus geölter Eiche mit Polstersitz in Naturleinen.',
                'details' => '<p>Clara begleitet jedes Dinner mit Anstand. Die schlanken Beine aus Massiveiche sind leicht angewinkelt und verleihen dem Stuhl Leichtigkeit ohne Stabilität zu opfern. Das abnehmbare Sitzkissen in Naturleinen lässt sich einfach reinigen.</p><p>Maße: B 46 × T 52 × H 80 cm</p>',
            ],
            [
                'title' => 'Barhocker Oslo',
                'price' => 389.00,
                'category' => 'stuehle',
                'color' => [168, 160, 144],
                'tag' => '',
                'description' => 'Skandinavischer Barhocker mit gedrechselten Eichenbeinen und Edelstahlring.',
                'details' => '<p>Oslo bringt nordische Klarheit an Ihre Theke oder Kücheninsel. Die vier Eichenbeine laufen konisch auf einen stabilen Edelstahl-Fußring zu. Das runde Sitzpolster in Wollfilz ist fest gepolstert und mit Knopf fixiert.</p><p>Sitzhöhe: 75 cm · Ø Sitzfläche: 35 cm</p>',
            ],
            [
                'title' => 'Schaukelstuhl Lena',
                'price' => 1290.00,
                'category' => 'stuehle',
                'color' => [120, 88, 56],
                'tag' => '',
                'description' => 'Massivholz-Schaukelstuhl aus amerikanischem Walnuss — ein Erbstück.',
                'details' => '<p>Lena ist handgefertigt und auf Langlebigkeit ausgelegt. Die fließenden Kufen aus Walnussvollholz, die organisch in die Armlehnen übergehen, wurden von einem Tischlermeister in Bayern entwickelt. Jedes Exemplar ist durch die Maserung einmalig.</p><p>Maße: B 68 × T 98 × H 104 cm</p>',
            ],
            [
                'title' => 'Polstersessel Berg',
                'price' => 2190.00,
                'category' => 'stuehle',
                'color' => [176, 160, 148],
                'tag' => 'Bestseller',
                'description' => 'Großer Clubsessel in hochwertigem Velours — die Einladung zum Verweilen.',
                'details' => '<p>Berg ist der klassische Clubsessel neu gedacht: breite Armlehnen, tiefer Sitz, nachgiebige Rückenlehne. Der Bezug aus feinem Velourstoff ist farbecht und pflegeleicht. Das Gestell aus massiver Buche ist unsichtbar und trägt eine Nutzlast von 150 kg.</p><p>Maße: B 90 × T 86 × H 82 cm</p>',
            ],
            [
                'title' => 'Bürostuhl Ergo',
                'price' => 1890.00,
                'category' => 'stuehle',
                'color' => [80, 88, 96],
                'tag' => 'Neu',
                'description' => 'Ergonomischer Drehstuhl aus Aluminium und hochwertigem Netzstoff für lange Arbeitstage.',
                'details' => '<p>Ergo ist der Arbeitsstuhl für Menschen, die Wert auf Gesundheit und Ästhetik legen. Lordosenstütze, Armlehnen und Sitzhöhe sind individuell einstellbar. Der atmungsaktive 3D-Netzstoff verhindert Hitzestau auch bei langen Sitzungen.</p><p>Sitzhöhe: 43–53 cm · Tragkraft: 130 kg</p>',
            ],

            // ── Tische ──────────────────────────────────────────────────────
            [
                'title' => 'Tisch Walnut',
                'price' => 2390.00,
                'category' => 'tische',
                'color' => [104, 72, 40],
                'tag' => 'Neu',
                'description' => 'Massiver Esstisch aus nordamerikanischem Walnussholz. Jede Platte ein Unikat.',
                'details' => '<p>Die Tischplatte wird aus einem einzigen Walnusstambour gefertigt und ist 4 cm stark. Die natürlichen Risse und Äste bleiben sichtbar und werden mit durchgefärbtem Holzkitt akzentuiert. Das Kreuzgestell aus mattschwarzem Stahl gibt dem Tisch eine ruhige Basis.</p><p>Maße: B 180 × T 90 × H 75 cm · Bis 8 Personen</p>',
            ],
            [
                'title' => 'Couchtisch Rund',
                'price' => 790.00,
                'category' => 'tische',
                'color' => [152, 144, 136],
                'tag' => 'Bestseller',
                'description' => 'Runder Couchtisch mit Marmor-Tischplatte und mattem Messinggestell.',
                'details' => '<p>Die Tischplatte aus weißem Carrara-Marmor (2 cm stark) ruht auf einem dreibeinigen Messinggestell in gebürsteter Ausführung. Die elegante Form macht ihn zur skulpturalen Mitte des Wohnzimmers.</p><p>Ø 60 cm · H 40 cm</p>',
            ],
            [
                'title' => 'Schreibtisch Nord',
                'price' => 1290.00,
                'category' => 'tische',
                'color' => [176, 160, 128],
                'tag' => '',
                'description' => 'Minimalistischer Arbeitstisch aus massiver Eiche mit diskretem Kabelmanagement.',
                'details' => '<p>Nord setzt auf klare Linien und Funktion. Die Eichenplatte (3 cm stark) ruht auf schlanken Vierkantbeinen aus Stahl. Eine durchgehende Schublade unter der Platte nimmt Kabel und Zubehör auf.</p><p>Maße: B 160 × T 75 × H 74 cm</p>',
            ],
            [
                'title' => 'Beistelltisch Trio',
                'price' => 490.00,
                'category' => 'tische',
                'color' => [192, 168, 128],
                'tag' => 'Neu',
                'description' => 'Set aus drei ineinandergreifenden Beistelltischen aus massiver Eiche — flexibel kombinierbar.',
                'details' => '<p>Das Trio-Set besteht aus drei Tischchen in unterschiedlichen Höhen (35 / 45 / 55 cm), die sich perfekt ineinanderschieben. Die runden Tischplatten aus Eiche passen zu jedem Sofa und lassen sich vielseitig anordnen.</p>',
            ],
            [
                'title' => 'Konsolentisch Luna',
                'price' => 890.00,
                'category' => 'tische',
                'color' => [168, 152, 112],
                'tag' => '',
                'description' => 'Schlanke Konsolentafel für den Flur aus Eiche und Messing.',
                'details' => '<p>Luna ist die elegante Empfangsgeste für Ihren Eingang. Die schmale Eichenplatte (Tiefe nur 28 cm) ruht auf zwei Messingbeinen in Haarlinienoptik. Ideal als Schlüssel- und Briefablage.</p><p>Maße: B 110 × T 28 × H 80 cm</p>',
            ],
            [
                'title' => 'Esstisch Oval',
                'price' => 3490.00,
                'category' => 'tische',
                'color' => [128, 96, 64],
                'tag' => '',
                'description' => 'Ovaler Massiveiche-Esstisch für bis zu 10 Personen — Mittelpunkt jedes Esszimmers.',
                'details' => '<p>Die ovale Form des Tisches fördert das Gespräch am Tisch und erlaubt eine großzügige Bestuhlung ohne tote Ecken. Die 4 cm starke Tischplatte aus europäischer Weißeiche ist geölt und zeigt die natürliche Maserung in ihrer vollen Schönheit.</p><p>Maße: B 220 × T 100 × H 75 cm</p>',
            ],
            [
                'title' => 'Gartentisch Loft',
                'price' => 1790.00,
                'category' => 'tische',
                'color' => [112, 96, 72],
                'tag' => 'Neu',
                'description' => 'Wetterfester Gartentisch aus recyceltem Teak — für Terrasse und Garten.',
                'details' => '<p>Loft ist aus recyceltem Teakholz gefertigt, das aus alten Fischerbooten und Gebäudebalken in Java gewonnen wird. Das Material ist von Natur aus wasser- und fäulnisresistent. Das Kufengestell aus Edelstahl ist seewasserbeständig.</p><p>Maße: B 200 × T 90 × H 74 cm</p>',
            ],

            // ── Sofas ───────────────────────────────────────────────────────
            [
                'title' => 'Sofa Lune',
                'price' => 3290.00,
                'category' => 'sofas',
                'color' => [176, 168, 160],
                'tag' => '',
                'description' => 'Modulares Sofa in weichem Naturleinen. Variantenreich kombinierbar.',
                'details' => '<p>Lune besteht aus einzeln kombinierbaren Elementen: 2-Sitzer, 3-Sitzer, Chaiselongue und Hocker. Das Gestell aus massiver Eiche ist dauerhaft, der Leinenbezug waschbar. Die hohen, abgerundeten Rückenpolster schaffen ein weiches Raumgefühl.</p><p>B 240 × T 95 × H 78 cm (Basiskonfiguration)</p>',
            ],
            [
                'title' => 'Sofa Arco',
                'price' => 4190.00,
                'category' => 'sofas',
                'color' => [136, 120, 112],
                'tag' => 'Neu',
                'description' => 'Geschwungenes Sofa mit rundem Profil — Samtbezug in Dunkelblau oder Kaschmir.',
                'details' => '<p>Arco hat ein kreisrundes Profil und eine durchgehend geschwungene Rückenlehne. Das Gestell aus gebogenem Buchenholz wird komplett mit hochwertigem Veloursstoff bezogen. Das Sofa ist in drei Farbvarianten erhältlich.</p><p>B 265 × T 100 × H 72 cm</p>',
            ],
            [
                'title' => 'Zweisitzer Mild',
                'price' => 2190.00,
                'category' => 'sofas',
                'color' => [160, 152, 144],
                'tag' => 'Bestseller',
                'description' => 'Kompaktes Stadtsofa für zwei — ideal für kleine Wohnungen.',
                'details' => '<p>Mild ist das perfekte Sofa für urbane Wohnräume. Kompakte Abmessungen ohne Verzicht auf Komfort: Der Memory-Schaum-Kern passt sich dem Körper an, der Wollbezug ist robust und pflegeleicht.</p><p>B 175 × T 85 × H 74 cm</p>',
            ],
            [
                'title' => 'Ecksofa Nord',
                'price' => 5490.00,
                'category' => 'sofas',
                'color' => [152, 144, 136],
                'tag' => '',
                'description' => 'Großzügiges L-förmiges Familiensofa in pflegeleichtem Strukturstoff.',
                'details' => '<p>Nord bietet Platz für die ganze Familie. Die L-Form ist in der Eckkonfiguration links oder rechts erhältlich. Der Strukturstoff in Hellgrau ist schmutzabweisend beschichtet und auch mit nassen Tüchern reinigbar.</p><p>B 310 × T 225 × H 80 cm</p>',
            ],
            [
                'title' => 'Daybed Zen',
                'price' => 2790.00,
                'category' => 'sofas',
                'color' => [192, 176, 152],
                'tag' => 'Neu',
                'description' => 'Tagesliege mit Teakgestell und Baumwoll-Matratzenbezug — Komfort und Ästhetik.',
                'details' => '<p>Zen ist halb Bett, halb Sofa. Die Teak-Karosserie mit ihren schlanken Beinen trägt eine 12 cm dicke Komfortmatratze. Ein kleines Rückenkissen aus gewebtem Baumwollstoff vervollständigt das Bild.</p><p>B 200 × T 90 × H 38 cm (Liegefläche)</p>',
            ],

            // ── Schränke ────────────────────────────────────────────────────
            [
                'title' => 'Schrank Tynd',
                'price' => 2990.00,
                'category' => 'schraenke',
                'color' => [72, 56, 40],
                'tag' => '',
                'description' => 'Kleiderschrank aus geräucherter Eiche. Schlichte Linienführung mit verdeckten Griffen.',
                'details' => '<p>Tynd (dänisch für „dünn") lebt von präzisen Proportionen. Die Fronten aus geräucherter Eiche wirken wie eine flächige Skulptur. Der Innenraum ist vollständig ausgebaut mit Kleiderstange, Fachböden und einem Schubladen-Insert.</p><p>B 120 × T 58 × H 220 cm</p>',
            ],
            [
                'title' => 'Sideboard Flach',
                'price' => 1890.00,
                'category' => 'schraenke',
                'color' => [128, 104, 72],
                'tag' => 'Bestseller',
                'description' => 'Niedriges Sideboard mit Schiebtüren aus gebürsteter Eiche — zeitlos und funktional.',
                'details' => '<p>Flach steht für cleane Linien und eine Tiefe von nur 40 cm. Das Sideboard ist mit zwei Schiebtüren aus gebürsteter Eiche versehen und bietet dahinter drei Ablagefächer. Ideal hinter dem Sofa oder im Esszimmer.</p><p>B 180 × T 40 × H 55 cm</p>',
            ],
            [
                'title' => 'Vitrine Glas',
                'price' => 2490.00,
                'category' => 'schraenke',
                'color' => [88, 80, 64],
                'tag' => 'Neu',
                'description' => 'Hohe Vitrine mit Glaseinsätzen aus geölter Eiche — für Sammler und Liebhaber.',
                'details' => '<p>Vitrine Glas besteht aus einem Eichenrahmen mit beidseitigen Glaseinsätzen. Die integrierte LED-Beleuchtung setzt Ihre Exponate optimal in Szene. Das untere Fach ist mit einer Massivholztür verschlossen.</p><p>B 60 × T 38 × H 200 cm</p>',
            ],
            [
                'title' => 'Schuhschrank Slim',
                'price' => 790.00,
                'category' => 'schraenke',
                'color' => [96, 80, 56],
                'tag' => '',
                'description' => 'Schmaler Schuhschrank für den Eingangsbereich aus Eiche und Aluminium.',
                'details' => '<p>Slim passt in jeden noch so kleinen Eingang. Die drei nach vorne klappenden Fächer bieten Platz für 12 Paar Schuhe. Die Front aus gebürsteter Eiche fügt sich harmonisch in jede Einrichtung. Tiefe geschlossen: nur 18 cm.</p><p>B 75 × T 18 × H 120 cm</p>',
            ],
            [
                'title' => 'Anrichte Bianco',
                'price' => 2190.00,
                'category' => 'schraenke',
                'color' => [208, 200, 184],
                'tag' => 'Neu',
                'description' => 'Weißlackierte Anrichte mit Messinggriffen — helles Pendant zu dunklen Holztönen.',
                'details' => '<p>Bianco setzt bewusst auf einen matten Weißlack als Kontrast zu warmem Holz und Naturstein. Die Messinggriffe sind handgegossen und leicht verschiedene — ein absichtliches Qualitätsmerkmal der Manufaktur.</p><p>B 160 × T 45 × H 80 cm</p>',
            ],
            [
                'title' => 'Hausbar Kuba',
                'price' => 3490.00,
                'category' => 'schraenke',
                'color' => [64, 48, 32],
                'tag' => 'Neu',
                'description' => 'Hausbar aus geräuchertem Nussbaum — mit Weinkühler, Glashalter und Schnaps-Schublade.',
                'details' => '<p>Kuba ist die perfekte Gastgeber-Möbel für den modernen Salon. Der integrierte Weinkühler (12 Flaschen) ist lautlos. Hinter der magnetischen Front verbergen sich ein Tablett, Glashalter für 8 Gläser und eine Schublade für Spirituosen.</p><p>B 90 × T 50 × H 110 cm</p>',
            ],

            // ── Betten ──────────────────────────────────────────────────────
            [
                'title' => 'Bett Nora',
                'price' => 2190.00,
                'category' => 'betten',
                'color' => [192, 176, 152],
                'tag' => 'Neu',
                'description' => 'Niedriges Plattformbett mit gepolstertem Kopfteil in Naturleinen.',
                'details' => '<p>Nora liegt bodennah und wirkt dadurch entspannend und weitläufig. Das Kopfteil ist 90 cm hoch und weich gepolstert in Naturleinen. Der Lattenrostrahmen aus Eiche ist in der Höhe der Matratze angepasst.</p><p>Für Matratze 160 × 200 cm · B 178 × T 215 × H 85 cm</p>',
            ],
            [
                'title' => 'Bett Holz',
                'price' => 1890.00,
                'category' => 'betten',
                'color' => [152, 120, 80],
                'tag' => 'Bestseller',
                'description' => 'Klassisches Massivholzbett aus europäischer Weißeiche — robust und langlebig.',
                'details' => '<p>Holz ist puristische Möbelkultur: Keine Schnörkel, kein Firlefanz — nur das ehrliche Material in seiner besten Form. Die Verbindungen sind gesäpft und verleimt, kein Nagel, keine Schraube sichtbar.</p><p>Für Matratze 180 × 200 cm</p>',
            ],
            [
                'title' => 'Boxspringbett Royal',
                'price' => 3990.00,
                'category' => 'betten',
                'color' => [160, 144, 128],
                'tag' => '',
                'description' => 'Luxuriöses Boxspringbett mit Taschenfederung und Topper aus Kaltschaum.',
                'details' => '<p>Royal kombiniert eine 25 cm Taschenfederkernmatratze mit einer 4 cm Kaltschaum-Auflage. Der Bezug aus feinem Bouclé-Stoff ist in drei Farben erhältlich. Das integrierte USB-Ladefach in der Kopfteilseite ist ein zeitgemäßes Extra.</p><p>Für Matratze 180 × 200 cm</p>',
            ],
            [
                'title' => 'Kinderbett Wald',
                'price' => 1290.00,
                'category' => 'betten',
                'color' => [144, 168, 136],
                'tag' => 'Neu',
                'description' => 'Kinderbett in Hausform aus massiver Kiefer — ein Ort zum Träumen.',
                'details' => '<p>Das Hausform-Bett schafft für Kinder eine Welt für sich. Die Kiefer wird in zertifizierter Forstwirtschaft gewonnen und mit wasserbasierter, ungiftiger Farbe lackiert. Umbaubar zum Standard-Einzelbett, wenn das Kind größer wird.</p><p>Für Matratze 70 × 140 cm · Lieferbar in Weiß und Naturkiefer</p>',
            ],
            [
                'title' => 'Einzelbett Mono',
                'price' => 1490.00,
                'category' => 'betten',
                'color' => [136, 120, 96],
                'tag' => '',
                'description' => 'Minimalistisches Einzelbett mit schwebend wirkendem Rahmen aus Eiche.',
                'details' => '<p>Mono setzt auf das Prinzip der schwebenden Linie. Der Bettrahmen aus Massiveiche ist auf schlanke 28 mm Breite reduziert und liegt als umlaufende Kontur um die Matratze. Das Bett eignet sich ideal für Gästezimmer.</p><p>Für Matratze 90 × 200 cm</p>',
            ],

            // ── Regale ──────────────────────────────────────────────────────
            [
                'title' => 'Regal Arc',
                'price' => 890.00,
                'category' => 'regale',
                'color' => [168, 144, 112],
                'tag' => '',
                'description' => 'Schwebendes Wandregal in asymmetrischer Bogenform, gefräst aus Eichenholz.',
                'details' => '<p>Arc wird aus einem massiven Eichenbrett CNC-gefräst. Die drei Bögen entstehen durch Aussparungen, die gleichzeitig als dekoratives Element wirken. Die unsichtbare Wandbefestigung lässt das Regal zu schweben scheinen.</p><p>B 90 × T 25 × H 60 cm · Traglast: 30 kg</p>',
            ],
            [
                'title' => 'Bücherregal Stave',
                'price' => 1290.00,
                'category' => 'regale',
                'color' => [144, 120, 88],
                'tag' => 'Bestseller',
                'description' => 'Hohes Standregal aus massiver Eiche mit verstellbaren Einlegeböden.',
                'details' => '<p>Stave ist ein klassisches Regal, das durch Materialstärke und Proportion überzeugt. Die 3,5 cm starken Böden aus Massiveiche verbiegen sich auch unter Last nicht. Neun Böden in drei Rasterstellungen bieten maximale Flexibilität.</p><p>B 100 × T 35 × H 220 cm · 9 Böden</p>',
            ],
            [
                'title' => 'Cube-Regal',
                'price' => 690.00,
                'category' => 'regale',
                'color' => [184, 168, 144],
                'tag' => 'Neu',
                'description' => 'Modulares Würfelregal aus Birkenholz — frei kombinierbar und stapelbar.',
                'details' => '<p>Das Cube-Regal besteht aus gleichgroßen Würfeln (40 × 40 × 40 cm), die übereinander, nebeneinander oder versetzt aufgebaut werden. Jedes Modul ist einzeln erhältlich und miteinander verbindbar. Lieferbar in Birke natur und Birke weiß.</p>',
            ],
            [
                'title' => 'Wandregal Set',
                'price' => 490.00,
                'category' => 'regale',
                'color' => [176, 160, 128],
                'tag' => '',
                'description' => '3er-Set schwebende Wandregale aus Eiche — für Küche, Büro oder Wohnzimmer.',
                'details' => '<p>Das Set umfasst drei Regale in Längen 30, 60 und 90 cm. Die Regale werden mit einem unsichtbaren French-Cleat-System befestigt, das schnellen Auf- und Abbau ermöglicht. Zugelassene Traglast: je 20 kg.</p>',
            ],
            [
                'title' => 'Leiterregal Lean',
                'price' => 790.00,
                'category' => 'regale',
                'color' => [136, 128, 112],
                'tag' => '',
                'description' => 'Freihängendes Leiterregal aus Eschenholz und Stahl — ohne Wandbefestigung.',
                'details' => '<p>Lean lehnt ohne Befestigung an der Wand und wird durch das Eigengewicht der Bücher gesichert. Die fünf Böden aus Eschenholz hängen auf dünnen Stahlseilen und können in der Höhe variiert werden.</p><p>B 60 × T 25 × H 190 cm</p>',
            ],
            [
                'title' => 'Wandregal Schreib',
                'price' => 1090.00,
                'category' => 'regale',
                'color' => [156, 136, 104],
                'tag' => 'Neu',
                'description' => 'Wandregal mit ausklappbarem Schreibtisch aus Massiveiche — das platzsparende Home Office.',
                'details' => '<p>Schreib vereint Regal und Arbeitsplatz auf minimalem Wandraum. Die Eichenplatte klappt auf 80 × 50 cm aus und bietet eine solide Arbeitsfläche. Zwei Fächer darüber halten Bücher und Ordner griffbereit.</p><p>B 80 × T 25 × H 90 cm (geschlossen)</p>',
            ],
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

    /** @param array{int, int, int} $rgb */
    private function createProductImage(string $title, array $rgb, int $collectionId): int
    {
        $width = 800;
        $height = 1000;
        $image = \imagecreatetruecolor($width, $height);

        // Lighter base tone
        $r = min(255, (int) ($rgb[0] + 30));
        $g = min(255, (int) ($rgb[1] + 30));
        $b = min(255, (int) ($rgb[2] + 30));

        $bg = \imagecolorallocate($image, $r, $g, $b);
        $accent = \imagecolorallocate($image, (int) ($rgb[0] * 0.85), (int) ($rgb[1] * 0.85), (int) ($rgb[2] * 0.85));
        $dark = \imagecolorallocate($image, (int) ($rgb[0] * 0.6), (int) ($rgb[1] * 0.6), (int) ($rgb[2] * 0.6));
        $white = \imagecolorallocate($image, 255, 255, 255);

        // Background
        \imagefilledrectangle($image, 0, 0, $width, $height, $bg);

        // Decorative rectangle
        \imagefilledrectangle($image, 80, 80, $width - 80, $height - 180, $accent);

        // Bottom label bar
        \imagefilledrectangle($image, 0, $height - 100, $width, $height, $dark);

        // Title
        $font = 5;
        $textWidth = \imagefontwidth($font) * \strlen($title);
        $x = (int) (($width - $textWidth) / 2);
        \imagestring($image, $font, max(0, $x), (int) ($height - 68), $title, $white);

        $tmp = \tempnam(\sys_get_temp_dir(), 'noven') . '.png';
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

    /** @param array{title:string,price:float,description:string,details:string,tag:string} $product */
    private function createProduct(array $product, int $categoryId, int $mediaId): string
    {
        $message = new CreateArticleMessage([
            'locale' => self::LOCALE,
            'template' => 'article',
            'title' => $product['title'],
            'url' => '/produkte/' . $this->slugify($product['title']),
            'price' => $product['price'],
            'description' => $product['description'],
            'category' => $categoryId,
            'image' => ['id' => $mediaId],
            'article' => $product['details'],
        ]);

        /** @var \Sulu\Article\Domain\Model\ArticleInterface $article */
        $article = $this->handle(new Envelope($message, [new EnableFlushStamp()]));

        return $article->getId();
    }

    private function publishProduct(string $uuid): void
    {
        $this->handle(new Envelope(
            new ApplyWorkflowTransitionArticleMessage(
                ['uuid' => $uuid],
                self::LOCALE,
                WorkflowInterface::WORKFLOW_TRANSITION_PUBLISH,
            ),
            [new EnableFlushStamp()],
        ));
    }

    private function seedHomepage(): void
    {
        $page = $this->pageRepository->findOneBy(
            ['locale' => self::LOCALE, 'stage' => DimensionContentInterface::STAGE_DRAFT],
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
            throw new \RuntimeException('Keine Startseite gefunden.');
        }

        $dimensionContent = $this->contentManager->resolve($page, [
            'locale' => self::LOCALE,
            'stage' => DimensionContentInterface::STAGE_DRAFT,
        ]);
        $data = $this->contentManager->normalize($dimensionContent);

        $data['locale'] = self::LOCALE;
        $data['template'] ??= 'homepage';
        $data['title'] = 'Noven — Designmöbel';
        $data['article'] = '<p>Willkommen bei Noven — Möbel mit individueller Ästhetik, Handwerkskunst und zeitlosem Design für moderne Wohnräume.</p>';

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
        $map = ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'Ä' => 'Ae', 'Ö' => 'Oe', 'Ü' => 'Ue', 'ß' => 'ss'];
        $value = strtr($value, $map);
        $value = \strtolower(\trim($value));
        $value = \preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';

        return \trim($value, '-');
    }
}
