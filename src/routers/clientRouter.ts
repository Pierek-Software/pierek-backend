import { Router } from "express";
import DatabaseService from "../services/DatabaseService";
import xml2js from "xml2js";
import { verifyAdminKey } from "./adminRouter";

export interface ClientRouter {
  databaseService: DatabaseService;
}

function createApiRouter({ databaseService }: ClientRouter) {
  const router = Router();

  router.get("/sitemap.xml", async (_, res) => {
    const posts = await databaseService.buildSitemap();

    const obj = { urlset: { $: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }, url: posts } };

    const builder = new xml2js.Builder({ xmldec: { version: "1.0", encoding: "UTF-8" } });
    const xml = builder.buildObject(obj);

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  });

  router.get("/products/static-paths", async (_, res) => {
    const response = await databaseService.getProductsSlugList();

    const transformed = response.map((slugObject) => {
      return {
        params: {
          slug: slugObject.slug,
        },
      };
    });

    res.json({ paths: transformed });
  });

  router.get("/pages/static-paths", async (_, res) => {
    const response = await databaseService.getPagesSlugList();

    const transformed = response.map((slugObject) => {
      return {
        params: {
          slug: slugObject.slug,
        },
      };
    });

    res.json({ paths: transformed });
  });

  router.get("/posts-list", async (_, res) => {
    const posts = await databaseService.getPostsList();

    res.json(posts);
  });

  router.get("/posts", async (req, res) => {
    let pagination = undefined;
    if (req.query.page && req.query.perPage) {
      pagination = {
        page: +req.query.page,
        perPage: +req.query.perPage,
      };
    }

    const response = await databaseService.getPosts({
      pagination,
    });
    res.json(response);
  });

  router.get("/authors", async (_, res) => {
    const response = await databaseService.getAuthors();
    res.json(response);
  });

  router.get("/posts/:slug", async (req, res) => {
    const { slug } = req.params;
    const response = await databaseService.getPost(slug);
    res.json(response);
  });

  router.get("/posts/:slug/recommendations", async (req, res) => {
    const { slug } = req.params;
    const response = await databaseService.getPostRecommendations({ postSlug: slug });
    res.json(response);
  });

  router.get("/pages/:slug", async (req, res) => {
    const { slug } = req.params;
    const response = await databaseService.getPage(slug);
    res.json(response);
  });

  router.get("/products", async (_, res) => {
    const response = await databaseService.getProducts();

    res.json(response);
  });

  router.get("/products/:slug", async (req, res) => {
    const response = await databaseService.getProductBySlug(req.params.slug);
    res.json(response);
  });

  router.post("/verify-key", async (req, res) => {
    verifyAdminKey(req.body.key);
    res.json(true);
  });

  return router;
}

export default createApiRouter;
