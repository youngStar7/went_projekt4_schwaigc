<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Reads the desired response format from either:
 *   - the ?_format=json query parameter, OR
 *   - an Accept: application/json header (only when text/html is absent,
 *     so regular browsers still get HTML).
 *
 * This is needed because Symfony's UrlMatcher only reads _format from the
 * route PATH (e.g. /nav.json), not from query parameters.  Without this
 * subscriber HeadlessWebsiteController::indexAction always falls back to
 * the Twig/HTML path.
 */
class RequestFormatSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        // Priority 20 → runs before the controller (priority 0)
        // but after the router listener (priority 32)
        return [KernelEvents::REQUEST => ['onKernelRequest', 20]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Do not interfere with the admin application
        if (\str_starts_with($request->getPathInfo(), '/admin')) {
            return;
        }

        // 1. Explicit query parameter takes highest priority
        $format = $request->query->get('_format');
        if (\is_string($format) && '' !== $format) {
            $request->setRequestFormat($format);
            return;
        }

        // 2. Negotiate from Accept header:
        //    Only switch to JSON when the client explicitly requests it
        //    and is NOT also accepting text/html (browsers always add text/html).
        $accept = $request->headers->get('Accept', '');
        if (
            \str_contains($accept, 'application/json')
            && !\str_contains($accept, 'text/html')
        ) {
            $request->setRequestFormat('json');
        }
    }
}
