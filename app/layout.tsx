export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Lax Clock</title>
      </head>
      <body>{children}</body>
    </html>
  );
}