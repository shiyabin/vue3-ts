import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import ElementPlus from 'unplugin-element-plus/vite';
// import Icons from 'unplugin-icons/vite';
import legacy from '@vitejs/plugin-legacy';
import IconsResolver from 'unplugin-icons/resolver';
import { ElementPlusResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
import VueI18n from '@intlify/vite-plugin-vue-i18n';
import type { ConfigEnv } from 'vite';
import { resolve } from 'path';
import { ViteDeploy } from '@yabinshi/deploy-plugin';
import DeployConfig from './deploy.config';
import { svgBuilder } from './svgBuilder';

export default (env: ConfigEnv) => {
  const { mode } = env;
  return [
    vue(),
    vueJsx(),
    svgBuilder(resolve('./src/assets/icons/')),
    AutoImport({
      dts: './types/auto-imports.d.ts',
      imports: ['vue', 'pinia', 'vue-router', 'vue-i18n'],
      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: false, // Default `false`
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      dts: './types/components.d.ts',
      extensions: ['vue', 'tsx'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      // imports 指定组件所在位置，默认为 src/components; 有需要也可以加上 view 目录
      dirs: ['src/components/'],
      resolvers: [ElementPlusResolver(), IconsResolver(), VueUseComponentsResolver()]
    }),
    VueI18n({
      include: [resolve(__dirname, '../locales/**')]
    }),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue']
    }),
    ElementPlus(),
    ViteDeploy((DeployConfig as any)[mode]) || null,
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ];
};
