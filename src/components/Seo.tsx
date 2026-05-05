import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description?: string;
  keywords?: string[];
};

export function Seo({ title, description, keywords }: SeoProps) {
  const keywordsContent = keywords?.filter(Boolean).join(", ");

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywordsContent ? <meta name="keywords" content={keywordsContent} /> : null}
      <meta property="og:title" content={title} />
      {description ? (
        <meta property="og:description" content={description} />
      ) : null}
      <meta name="twitter:card" content="summary" />
    </Helmet>
  );
}
