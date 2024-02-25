/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from "knex";
import { v4 } from "uuid";

export interface Pagination {
  page: number;
  perPage: number;
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  description: string;
  avatar: string;
}
export interface CategoryModel {
  id: number;
  name: string;
  slug: string;
}
export interface PostModel {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  markdown: string;
  author_id: number;
  status: "draft" | "active";
  author?: Author;
  categories?: CategoryModel[];
}

export interface GetPostRecommendations {
  postSlug: string;
}

export interface GetPosts {
  pagination?: Pagination;
}

export interface DatabaseServiceDependencies {
  knex: Knex;
}

class DatabaseService {
  constructor(private dependencies: DatabaseServiceDependencies) {}

  async buildSitemap() {
    const posts = await this.dependencies.knex("post");

    const postsToSitemap = posts.map((post) => {
      return {
        loc: `https://pierek.com/blog/${post.slug}`,
        lastmod: new Date(post.updated_at).toISOString(),
      };
    });

    return postsToSitemap;
  }

  async getProductsSlugList() {
    const products = await this.dependencies.knex.select("slug").from("product");
    return products;
  }

  async getPagesSlugList() {
    const pages = await this.dependencies.knex.select("slug").from("page");
    return pages;
  }

  async getProducts() {
    const products = await this.dependencies.knex.select("*").from("product");

    return await Promise.all(
      products.map(async (product) => {
        const brand = await this.dependencies.knex.select("*").from("brand").where("id", product.brand_id).first();

        return { ...product, brand };
      }),
    );
  }

  async getProductById(id: number) {
    const product = await this.dependencies.knex.select("*").from("product").where("id", id).first();
    const brand = await this.dependencies.knex.select("*").from("brand").where("id", product.brand_id).first();

    return { ...product, brand };
  }

  async getProductBySlug(slug: string) {
    const product = await this.dependencies.knex.select("*").from("product").where("slug", slug).first();
    const brand = await this.dependencies.knex.select("*").from("brand").where("id", product.brand_id).first();

    return { ...product, brand };
  }

  async updatePage(page: any) {
    const payload = {
      title: page.title,
      description: page.description,
      slug: page.slug,
      image: page.image,
      author_id: page.author_id,
      created_at: page.created_at,
      updated_at: page.updated_at,

      dictionary: JSON.stringify(page.dictionary),
      content: JSON.stringify(page.contentBlocks),
    };

    await this.dependencies.knex("page").update(payload);
    return page;
  }

  async createPage(page: any) {
    const uuid = v4();

    const payload = {
      id: uuid,
      dictionary: JSON.stringify([1, 2, 3]),
      image: page.image,
      created_at: page.created_at,
      updated_at: page.updated_at,
      author_id: page.author_id,
      slug: "best-gaming-laptops",
      title: page.title,
      description: page.description,
      content: JSON.stringify(page.contentBlocks),
    };

    await this.dependencies.knex("page").insert(payload);

    return page;
  }

  async getPageById(id: string) {
    const page = await this.dependencies.knex.select("*").from("page").where("page.id", id).first();

    return this.getPage(page.slug);
  }

  async getPage(slug: string) {
    const page = await this.dependencies.knex.select("*").from("page").where("page.slug", slug).first();

    const author = await this.dependencies.knex.select("*").from("author").where("id", page.author_id).first();

    const content = await Promise.all(
      page.content.map(async (contentBlock: any) => {
        if (contentBlock.type === "quick_list") {
          const value = await Promise.all(
            contentBlock.value.map(async (quickListItem: any) => {
              const product = await this.dependencies.knex
                .select("*")
                .from("product")
                .where("id", quickListItem.product_id)
                .first();

              const brand = await this.dependencies.knex
                .select("*")
                .from("brand")
                .where("id", product.brand_id)
                .first();

              return { ...quickListItem, product: { ...product, brand } };
            }),
          );

          return { ...contentBlock, value };
        }
        if (contentBlock.type === "product_review") {
          const product = await this.dependencies.knex
            .select("*")
            .from("product")
            .where("id", contentBlock.value.product_id)
            .first();

          const brand = await this.dependencies.knex.select("*").from("brand").where("id", product.brand_id).first();

          return { ...contentBlock, value: { ...contentBlock.value, product: { ...product, brand } } };
        }
        return contentBlock;
      }),
    );

    return { ...page, author, content };
  }

  async getPost(slug: string) {
    const post = await this.dependencies.knex.select("*").from("post").where("post.slug", slug).first();

    const author = await this.dependencies.knex.select("*").from("author").where("id", post.author_id).first();

    const categories = await this.dependencies.knex
      .select("*")
      .from("post_category")
      .where("post_id", post.id)
      .leftJoin("category", "post_category.category_id", "category.id");

    const recommendations = await this.getPosts({ pagination: { page: 1, perPage: 4 } });

    return { ...post, author, categories, recommendations: recommendations.data };
  }

  async getPostRecommendations({ postSlug }: GetPostRecommendations) {
    const date = new Date().toISOString();

    const postsQuery = this.dependencies.knex
      .select("*")
      .from("post")
      .orderBy("post.created_at", "desc")
      .where("post.status", "active")
      .whereNot("post.slug", postSlug)
      .andWhere("post.created_at", "<=", date)
      .limit(4);

    const posts = await postsQuery;

    const postsWithCategoriesAndAuthor = await Promise.all(
      posts.map(async (post) => {
        const categories = await this.dependencies.knex
          .select("*")
          .from("post_category")
          .where("post_id", post.id)
          .leftJoin("category", "post_category.category_id", "category.id");

        const author = await this.dependencies.knex.select("*").from("author").where("id", post.author_id).first(); // Assuming there's only one author for each post

        return { ...post, categories, author };
      }),
    );

    return postsWithCategoriesAndAuthor;
  }

  async getAuthors() {
    const query = this.dependencies.knex.select("*").from("author");
    return query;
  }

  async getPostsList() {
    const date = new Date().toISOString();

    const postsListQuery = this.dependencies.knex
      .select(["title", "id", "slug", "status", "created_at"])
      .from("post")
      .where("post.status", "active")
      .andWhere("post.created_at", "<=", date);

    return postsListQuery;
  }

  async getPosts({ pagination }: GetPosts) {
    const date = new Date().toISOString();

    let postsQuery = this.dependencies.knex
      .select("*")
      .from("post")
      .orderBy("post.created_at", "desc")
      .where("post.status", "active")
      .andWhere("post.created_at", "<=", date);

    const postsCount = await postsQuery.clone().clearSelect().clearOrder().count();
    const total = +postsCount[0].count;

    if (pagination) {
      const offset = (pagination.page - 1) * pagination.perPage;
      postsQuery = postsQuery.limit(pagination.perPage).offset(offset);
    }

    const posts = await postsQuery;

    const postsWithCategoriesAndAuthor = await Promise.all(
      posts.map(async (post) => {
        const categories = await this.dependencies.knex
          .select("*")
          .from("post_category")
          .where("post_id", post.id)
          .leftJoin("category", "post_category.category_id", "category.id");

        const author = await this.dependencies.knex.select("*").from("author").where("id", post.author_id).first(); // Assuming there's only one author for each post

        return { ...post, categories, author };
      }),
    );

    let returnObject: { data: any[]; pagination?: { page: number; pages: number; total: number; perPage: number } } = {
      data: postsWithCategoriesAndAuthor,
    };

    if (pagination) {
      returnObject = {
        data: postsWithCategoriesAndAuthor,
        pagination: {
          ...pagination,
          perPage: pagination.perPage,
          pages: Math.ceil(total / pagination.perPage),
          total,
        },
      };
    }

    return returnObject;
  }
}

export default DatabaseService;
