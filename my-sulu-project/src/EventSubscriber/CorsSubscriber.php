<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Response;

class CorsSubscriber implements EventSubscriberInterface
{
    /** Origins allowed to call the website (headless) API. */
    private const ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ];

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST  => ['onKernelRequest', 10],
            KernelEvents::RESPONSE => ['onKernelResponse', 10],
        ];
    }

    /** Handle preflight OPTIONS requests immediately. */
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if ('OPTIONS' !== $request->getMethod()) {
            return;
        }

        $origin = $request->headers->get('Origin', '');
        if (!\in_array($origin, self::ALLOWED_ORIGINS, true)) {
            return;
        }

        $response = new Response('', Response::HTTP_NO_CONTENT);
        $this->addCorsHeaders($response, $origin);
        $event->setResponse($response);
    }

    /** Add CORS headers to every website (non-admin) response. */
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Skip admin context
        if (\str_starts_with($request->getPathInfo(), '/admin')) {
            return;
        }

        $origin = $request->headers->get('Origin', '');
        if (!\in_array($origin, self::ALLOWED_ORIGINS, true)) {
            return;
        }

        $this->addCorsHeaders($event->getResponse(), $origin);
    }

    private function addCorsHeaders(Response $response, string $origin): void
    {
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Type, Authorization');
        $response->headers->set('Access-Control-Max-Age', '86400');
        $response->headers->set('Vary', 'Origin');
    }
}
