export interface WikiFrontmatter {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface WikiPage {
  slug: string;
  frontmatter: WikiFrontmatter;
  content: string;
  revision?: string;
  html?: string;
  toc?: TocItem[];
}

export interface WikiListItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  updatedAt?: string;
}
