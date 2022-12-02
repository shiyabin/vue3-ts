import type { App, Component } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

export function setupElementIcons(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as Component);
  }
}
