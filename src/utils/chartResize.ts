import { debounce } from '@/utils';
export default function (chart: any) {
  let $_sidebarElm: any = null;
  let $_resizeHandler: any = null;
  onMounted(() => {
    initListener();
  });
  onActivated(() => {
    !$_resizeHandler && initListener();
    resize();
  });
  onBeforeUnmount(() => {
    destroyListener();
  });
  onDeactivated(() => {
    destroyListener();
  });

  function initListener() {
    $_resizeHandler = debounce(() => {
      resize();
    }, 100);
    window.addEventListener('resize', $_resizeHandler);
    $_sidebarElm = document.getElementsByClassName('sidebar-container')[0];
    if ($_sidebarElm) {
      $_sidebarElm.addEventListener('transitionend', $_sidebarResizeHandler);
    }
  }
  function destroyListener() {
    window.removeEventListener('resize', $_resizeHandler);
    $_resizeHandler = null;
    if ($_sidebarElm) {
      $_sidebarElm.removeEventListener('transitionend', $_sidebarResizeHandler);
    }
  }
  function $_sidebarResizeHandler(e: any) {
    if (e.propertyName === 'width') {
      $_resizeHandler();
    }
  }
  function resize() {
    chart && chart.resize();
  }
}
