import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  function format(date: string): string {
    return new Date(date)
      .toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace('de ', '')
      .replace('de ', '')
      .replace('.', '');
  }

  const { isFallback } = useRouter();

  const totalWorlds = post?.data?.content?.reduce(
    (total, content) =>
      total +
      content.heading.split(/\s/).length +
      RichText.asText(content.body).split(/\s/).length,
    0
  );

  const readTime = Math.ceil(totalWorlds / 200);
  return (
    <>
      <Header />
      {isFallback ? (
        <p>Carregando...</p>
      ) : (
        <div className={styles.container}>
          <img src={post.data.banner.url} alt="Banner" />
          <time>{format(post.first_publication_date)}</time>
          <strong>{readTime} min</strong>
          <strong>{post.data.title}</strong>
          <p>{post.data.author}</p>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const posts = response.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: posts,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: { post },
    revalidate: 60 * 60, // 1 hour
  };
};
