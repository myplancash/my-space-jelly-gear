import Head from 'next/head'
import Link  from 'next/link'
import Layout from '@components/Layout';
import Header from '@components/Header';
import Container from '@components/Container';
import Button from '@components/Button';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { buildImage } from '@lib/cloudinary'; 

import styles from '@styles/Page.module.scss'

export default function Category({ category, products }) {

  /* const url = cld.image(products[0].image.public_id).toURL();
  console.log("url", url);
  console.log('category', category);
  console.log('products', products); */

  return (
    <Layout>
      <Head>
        <title>{category.name}</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container>
        <h1>{category.name}</h1>

        <h2>Products</h2>

        <ul className={styles.products}>
          {products.map(product => {

            const imageUrl = buildImage(product.image.public_id).resize('w_900,h_900').toURL();

            return (
              <li key={product.id}>
              <Link href={`/products/${product.slug}`}>
                <a>
                  <div className={styles.productImage}>
                    <img 
                      src={imageUrl} 
                      alt={product.name} 
                      width='900'
                      height='900'
                    />
                  </div>
                  <h3 className={styles.productTitle}>
                    {product.name}
                  </h3>
                  <p className={styles.productPrice}>
                    ${product.price.toFixed(2)}
                  </p>
                </a>
              </Link>
              <p>
                <Button
                className="snipcart-add-item"
                data-item-id={product.id}
                data-item-price={product.price}
                data-item-url={`/products/${product.slug}`}
                data-item-image={product.image.url}
                data-item-name={product.name}
                >
                  Add to Cart
                </Button>
              </p>
            </li>
            )
          })}
        </ul>
      </Container>
    </Layout>
  )
}


export async function getStaticProps({ params }) {
  const client = new ApolloClient({
    uri: 'https://api-us-west-2.hygraph.com/v2/clbe9wuyy067p01te94i3a4ci/master',
    cache: new InMemoryCache(),
  });

  const data = await client.query({
    query: gql`
      query PageCategory($slug: String = "") {
        category(where: {slug: $slug}) {
          id
          name
          slug
          products {
            id
            image
            name
            price
            slug
          }
        }
      }
    `,
    variables: {
      slug: params.categorySlug
    }
  })


  const category = data.data.category;
  
  return {
    props: {
      category,
      products: category.products
    }
  }
}

export async function getStaticPaths({ locales }) {

  const client = new ApolloClient({
    uri: 'https://api-us-west-2.hygraph.com/v2/clbe9wuyy067p01te94i3a4ci/master',
    cache: new InMemoryCache(),
  });

  const data = await client.query({
    query: gql`
      query PageCategories {
        categories {
          id
          slug
        }
      }
    `
  })

  const paths = data.data.categories.map(category => {
    return {
      params: {
        categorySlug: category.slug
      }
    }
  })


  console.log('paths', paths);

  return {
    paths: [
      ...paths,
      ...paths.flatMap(path => {
        return locales.map(locale => {
          return {
            ...path,
            locale
          }  
        })
      })
    ],
    fallback: false,
  }
}