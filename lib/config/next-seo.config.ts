import { DefaultSeoProps } from "next-seo";

import { HeadSeoProps } from "@components/seo/head-seo";

const seoImages = {
  default: "https://scheduler.hibox.co/HiboxSeoImage.PNG",
  ogImage: "https://og-image-one-pi.vercel.app/",
};

export const getSeoImage = (key: keyof typeof seoImages): string => {
  return seoImages[key];
};

export const seoConfig: {
  headSeo: Required<Pick<HeadSeoProps, "siteName">>;
  defaultNextSeo: DefaultSeoProps;
} = {
  headSeo: {
    siteName: "Hibox Scheduler",
  },
  defaultNextSeo: {
    twitter: {
      handle: "@hibox",
      site: "@hibox",
      cardType: "summary_large_image",
    },
  },
} as const;
