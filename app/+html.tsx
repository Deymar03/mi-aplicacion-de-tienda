// Plantilla HTML de la versión web (solo se usa al generar la web, no afecta al celular).
// Declara que la página está en español y bloquea la traducción automática del navegador
// (Chrome traducía "Pan" como "Sartén").

import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es" translate="no" className="notranslate">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Language" content="es" />
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
      </head>
      <body translate="no" className="notranslate">
        {children}
      </body>
    </html>
  );
}
