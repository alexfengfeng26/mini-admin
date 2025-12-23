import { BaseEntity, PaginationParams } from './shared.types';

// ==================== 通用 CMS 类型 ====================

// CMS 内容状态枚举
export enum CmsStatus {
  DRAFT = 0,      // 草稿
  PUBLISHED = 1,  // 已发布
  ARCHIVED = 2,   // 已下架
}

// CMS 查询参数基类
export interface CmsQueryDto extends PaginationParams {
  status?: number;
  categoryId?: number;
  tagId?: number;
  keyword?: string; // 搜索关键词
}

// SEO 字段
export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// ==================== 分类类型 ====================

// 分类实体
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  type: string; // article, page, product, document
  description?: string;
  parentId?: number;
  sort: number;
  status: number;
}

// 创建分类 DTO
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  type: string;
  description?: string;
  parentId?: number;
  sort?: number;
  status?: number;
}

// 更新分类 DTO
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  parentId?: number;
  sort?: number;
  status?: number;
}

// 分类查询参数
export interface CategoryQueryDto extends PaginationParams {
  type: string; // 必填：分类类型
  status?: number;
  parentId?: number;
  keyword?: string;
}

// 分类树节点
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

// ==================== 标签类型 ====================

// 标签实体
export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  type: string; // article, page, product, document
}

// 创建标签 DTO
export interface CreateTagDto {
  name: string;
  slug?: string;
  type: string;
}

// 更新标签 DTO
export interface UpdateTagDto {
  name?: string;
  slug?: string;
  type?: string;
}

// 标签查询参数
export interface TagQueryDto extends PaginationParams {
  type: string; // 必填：标签类型
  keyword?: string;
}

// ==================== 文章类型 ====================

// 文章实体
export interface Article extends BaseEntity, SeoFields {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: number;
  status: number;
  featured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorId: number;
  publishedAt?: string;
  metadata?: any;
  category?: Category;
  author?: any;
  tags?: Tag[];
}

// 创建文章 DTO
export interface CreateArticleDto {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId?: number;
  status?: number;
  featured?: boolean;
  publishedAt?: string;
  tagNames?: string[]; // 标签名称数组
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 更新文章 DTO
export interface UpdateArticleDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: number;
  status?: number;
  featured?: boolean;
  publishedAt?: string;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 文章查询参数
export interface ArticleQueryDto extends CmsQueryDto {
  featured?: boolean;
  authorId?: number;
  startDate?: string;
  endDate?: string;
}

// 文章列表项
export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  status: number;
  featured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  author: string;
  publishedAt?: string;
  createdAt: string;
  tags?: string;
}

// ==================== 页面类型 ====================

// 页面实体
export interface Page extends BaseEntity, SeoFields {
  title: string;
  slug: string;
  content: string;
  template?: string;
  categoryId?: number;
  status: number;
  metadata?: any;
  category?: Category;
  tags?: Tag[];
}

// 创建页面 DTO
export interface CreatePageDto {
  title: string;
  slug?: string;
  content: string;
  template?: string;
  categoryId?: number;
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 更新页面 DTO
export interface UpdatePageDto {
  title?: string;
  slug?: string;
  content?: string;
  template?: string;
  categoryId?: number;
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 页面查询参数
export interface PageQueryDto extends CmsQueryDto {
  template?: string;
}

// 页面列表项
export interface PageListItem {
  id: number;
  title: string;
  slug: string;
  template?: string;
  category?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  tags?: string;
}

// ==================== 产品类型 ====================

// 产品实体
export interface Product extends BaseEntity, SeoFields {
  name: string;
  code: string;
  slug: string;
  description?: string;
  price?: number;
  stock: number;
  categoryId?: number;
  images?: string; // JSON 字符串
  status: number;
  viewCount: number;
  salesCount: number;
  metadata?: any;
  category?: Category;
  tags?: Tag[];
}

// 创建产品 DTO
export interface CreateProductDto {
  name: string;
  code: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  images?: string[];
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 更新产品 DTO
export interface UpdateProductDto {
  name?: string;
  code?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  images?: string[];
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 产品查询参数
export interface ProductQueryDto extends CmsQueryDto {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean; // 是否有库存
}

// 产品列表项
export interface ProductListItem {
  id: number;
  name: string;
  code: string;
  slug: string;
  price?: number;
  stock: number;
  category?: string;
  status: number;
  viewCount: number;
  salesCount: number;
  createdAt: string;
  tags?: string;
}

// ==================== 文档类型 ====================

// 文档实体
export interface Document extends BaseEntity, SeoFields {
  title: string;
  slug: string;
  content: string;
  version: string;
  categoryId?: number;
  fileUrl?: string;
  fileSize?: number;
  downloadCount: number;
  viewCount: number;
  status: number;
  metadata?: any;
  category?: Category;
  tags?: Tag[];
}

// 创建文档 DTO
export interface CreateDocumentDto {
  title: string;
  slug?: string;
  content: string;
  version: string;
  categoryId?: number;
  fileUrl?: string;
  fileSize?: number;
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 更新文档 DTO
export interface UpdateDocumentDto {
  title?: string;
  slug?: string;
  content?: string;
  version?: string;
  categoryId?: number;
  fileUrl?: string;
  fileSize?: number;
  status?: number;
  tagNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metadata?: any;
}

// 文档查询参数
export interface DocumentQueryDto extends CmsQueryDto {
  version?: string;
}

// 文档列表项
export interface DocumentListItem {
  id: number;
  title: string;
  slug: string;
  version: string;
  category?: string;
  fileUrl?: string;
  fileSize?: number;
  downloadCount: number;
  viewCount: number;
  status: number;
  createdAt: string;
  tags?: string;
}
