export default function Head() {
  return (
    <>
      <title>Robô C.A.L.M.A.</title>
      <meta name="description" content="Seu assistente de bem-estar, equilíbrio e leveza." />

      {/* Favicon e ícones */}
      <link rel="icon" href="/icon.png" />
      <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#1e40af" />

      {/* iOS: modo app (sem barra do Safari) */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Robô C.A.L.M.A." />
    </>
  );
}
