import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';

export default class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Main />
        <NextScript />
      </Html>
    );
  }
}
