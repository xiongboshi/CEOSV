import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from "element-plus";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'cesium',
    component: () => import('../views/cesium.vue')
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import('../views/404.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes
})

/**
 * 全局前置路由守卫，每一次路由跳转前都进入这个 beforeEach 函数
 */
let whiteArr = ["/login", "/404", "/"];  //可直接访问的页面
 
 router.beforeEach((to, from, next) => {
  if (whiteArr.includes(to.path)) {
      // 登录或者注册才可以往下进行
      next();
  } else {
      // 获取 token
      const token = localStorage.getItem('Authorization'); 
      // token 不存在
      if (token === null || token === '') {
          ElMessage.error('您还没有登录，请先登录');
          next('/login');
      } else {
          next();
      }
  }
});

export default router
