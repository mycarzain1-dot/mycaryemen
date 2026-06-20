import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-[var(--color-gold)]">404</h1>
        <h2 className="mt-4 text-xl font-bold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-gold">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">يمكنك المحاولة مجدداً أو العودة للرئيسية.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-gold"
          >
            حاول مرة أخرى
          </button>
          <a href="/" className="btn-outline">الرئيسية</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MY CAR — مركز متكامل للعناية بالسيارات" },
      { name: "description", content: "ماي كار -مركز و متجر وخدمات متكاملة للعناية بالسيارات في صنعاء. PPF، نانو سيراميك، تنجيد، اكسسوارات، ومنتجات فاخرة." },
      { name: "author", content: "MY CAR" },
      { property: "og:title", content: "MY CAR — مركز متكامل للعناية بالسيارات" },
      { property: "og:description", content: "ماي كار -مركز و متجر وخدمات متكاملة للعناية بالسيارات في صنعاء. PPF، نانو سيراميك، تنجيد، اكسسوارات، ومنتجات فاخرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "MY CAR — مركز متكامل للعناية بالسيارات" },
      { name: "twitter:description", content: "ماي كار -مركز و متجر وخدمات متكاملة للعناية بالسيارات في صنعاء. PPF، نانو سيراميك، تنجيد، اكسسوارات، ومنتجات فاخرة." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d709b619-a7d5-407b-9d94-37851754919f" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d709b619-a7d5-407b-9d94-37851754919f" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('mycar_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { CartProvider } from "@/lib/cart";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
