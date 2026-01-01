export interface WikiFrontmatter {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface WikiPage {
  slug: string;
  frontmatter: WikiFrontmatter;
  content: string;
  html?: string;
}

export interface WikiListItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  updatedAt?: string;
}
