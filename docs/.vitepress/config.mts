import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "taro hooks",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'UseCountDown', link: '/guide/use-count-down' },
          { text: 'UseLatest', link: '/guide/use-latest' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jd-antelope/taro-hooks' }
    ]
  }
})
