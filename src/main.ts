import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import '@/mitt';
import './assets/main.css';
// 注册所有element icons
import { setupElementIcons } from '@/plugins/elementIcons';

const app = createApp(App);

app.use(createPinia());
app.use(router);
setupElementIcons(app);
app.mount('#app');
