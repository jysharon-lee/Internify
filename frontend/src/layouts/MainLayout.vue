<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-icon">✦</span>
          <Transition name="fade"><span v-if="!sidebarCollapsed" class="logo-text">Internify</span></Transition>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar" v-if="!isMobile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" v-if="!sidebarCollapsed"/><path d="M9 18l6-6-6-6" v-else/>
          </svg>
        </button>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="section-label" v-if="!sidebarCollapsed">Main</span>
          <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="nav-item" :class="{ active: $route.path.startsWith(item.path) }" :title="sidebarCollapsed ? item.label : ''">
            <span class="nav-icon" v-html="item.icon"></span>
            <Transition name="fade"><span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span></Transition>
            <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          </RouterLink>
        </div>
      </nav>
      <div class="sidebar-footer">
        <RouterLink to="/profile" class="sidebar-user" :title="sidebarCollapsed ? authStore.fullName : ''">
          <div class="user-avatar">{{ initials }}</div>
          <Transition name="fade">
            <div v-if="!sidebarCollapsed" class="user-info">
              <span class="user-name">{{ authStore.fullName }}</span>
              <span class="user-role">Student</span>
            </div>
          </Transition>
        </RouterLink>
        <button class="logout-btn" @click="logout" :title="sidebarCollapsed ? 'Logout' : ''">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          <Transition name="fade"><span v-if="!sidebarCollapsed">Logout</span></Transition>
        </button>
      </div>
    </aside>

    <div class="main-content">
      <header class="navbar">
        <div class="navbar-left">
          <button class="mobile-menu-btn" @click="toggleMobileSidebar" v-if="isMobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 class="navbar-title">{{ pageTitle }}</h1>
        </div>
        <div class="navbar-right">
          <div class="notif-btn-wrap" ref="notifRef">
            <button class="icon-btn" @click="showNotifs = !showNotifs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span v-if="notifStore.unreadCount" class="notif-dot">{{ notifStore.unreadCount }}</span>
            </button>
            <div class="notif-panel" v-if="showNotifs">
              <div class="notif-panel-header">
                <span>Notifications</span>
                <button @click="notifStore.markAllRead(); showNotifs=false" class="notif-mark-read">Mark all read</button>
              </div>
              <div class="notif-list">
                <div v-for="n in notifStore.notifications.slice(0,5)" :key="n.id" class="notif-item" :class="{ unread: !n.read }" @click="notifStore.markRead(n.id); showNotifs=false">
                  <span class="notif-type-dot" :class="n.type"></span>
                  <div><p class="notif-title">{{ n.title }}</p><p class="notif-msg">{{ n.message }}</p></div>
                </div>
                <div v-if="!notifStore.notifications.length" class="notif-empty">No notifications yet</div>
              </div>
            </div>
          </div>
          <RouterLink to="/profile" class="navbar-avatar">{{ initials }}</RouterLink>
        </div>
      </header>
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in"><component :is="Component" /></Transition>
        </RouterView>
      </main>
    </div>

    <nav class="bottom-nav" v-if="isMobile">
      <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="bottom-nav-item" :class="{ active: $route.path.startsWith(item.path) }">
        <span class="bottom-nav-icon" v-html="item.icon"></span>
        <span class="bottom-nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="mobile-overlay" v-if="isMobile && mobileSidebarOpen" @click="mobileSidebarOpen=false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore }        from '@/stores/auth.store'
import { useApplicationStore } from '@/stores/application.store'
import { useNotificationStore } from '@/stores/notification.store'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()
const appStore  = useApplicationStore()
const notifStore = useNotificationStore()

const sidebarCollapsed  = ref(false)
const mobileSidebarOpen = ref(false)
const isMobile          = ref(false)
const showNotifs        = ref(false)
const notifRef          = ref(null)

const initials  = computed(() => (authStore.fullName || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2))
const pageTitle = computed(() => ({ dashboard:'Dashboard', discover:'Discover Internships', tracker:'Application Tracker', analytics:'Analytics', profile:'My Profile', 'internship-detail':'Internship Detail' })[route.name] || 'Internify')

const ICONS = {
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  discover:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  tracker:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  analytics: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  profile:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
}
const navItems = computed(() => [
  { name:'dashboard', path:'/dashboard', label:'Dashboard',  icon:ICONS.dashboard },
  { name:'discover',  path:'/discover',  label:'Discover',   icon:ICONS.discover },
  { name:'tracker',   path:'/tracker',   label:'Tracker',    icon:ICONS.tracker, badge: appStore.activeCount || null },
  { name:'analytics', path:'/analytics', label:'Analytics',  icon:ICONS.analytics },
  { name:'profile',   path:'/profile',   label:'Profile',    icon:ICONS.profile },
])

function toggleSidebar()       { sidebarCollapsed.value = !sidebarCollapsed.value }
function toggleMobileSidebar() { mobileSidebarOpen.value = !mobileSidebarOpen.value }
function checkMobile()         { isMobile.value = window.innerWidth < 768 }
function logout()              { authStore.logout(); router.push({ name:'login' }) }
function handleClickOutside(e) { if (notifRef.value && !notifRef.value.contains(e.target)) showNotifs.value = false }

onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile); document.addEventListener('click', handleClickOutside); notifStore.seedDemo(); appStore.fetchAll() })
onUnmounted(() => { window.removeEventListener('resize', checkMobile); document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
.main-layout { display:flex; min-height:100vh; }
.sidebar { position:fixed; top:0; left:0; bottom:0; width:var(--sidebar-width); background:#fff; border-right:1px solid var(--gray-200); display:flex; flex-direction:column; z-index:200; transition:width 0.25s ease; overflow:hidden; }
.sidebar.collapsed { width:var(--sidebar-collapsed); }
.sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1rem; height:var(--navbar-height); border-bottom:1px solid var(--gray-100); flex-shrink:0; }
.sidebar-logo { display:flex; align-items:center; gap:0.5rem; overflow:hidden; }
.logo-icon { font-size:1.25rem; color:var(--brand-primary); flex-shrink:0; }
.logo-text { font-size:1.1rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em; white-space:nowrap; }
.sidebar-toggle { background:none; border:1px solid var(--gray-200); border-radius:var(--border-radius-sm); padding:0.3rem; color:var(--gray-500); display:flex; align-items:center; transition:var(--transition); flex-shrink:0; }
.sidebar-toggle:hover { background:var(--gray-100); }
.sidebar-nav { flex:1; padding:1rem 0.75rem; overflow-y:auto; }
.nav-section { display:flex; flex-direction:column; gap:0.15rem; }
.section-label { font-size:0.7rem; font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.08em; padding:0 0.5rem; margin-bottom:0.5rem; }
.nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:var(--border-radius-sm); color:var(--gray-600); font-size:0.875rem; font-weight:500; transition:var(--transition); overflow:hidden; white-space:nowrap; text-decoration:none; }
.nav-item:hover { background:var(--gray-100); color:var(--gray-900); }
.nav-item.active { background:var(--brand-primary-light); color:var(--brand-primary); font-weight:600; }
.nav-icon { flex-shrink:0; display:flex; }
.nav-label { flex:1; }
.nav-badge { background:var(--brand-primary); color:#fff; font-size:0.68rem; font-weight:700; padding:0.1rem 0.45rem; border-radius:999px; flex-shrink:0; }
.sidebar-footer { padding:0.75rem; border-top:1px solid var(--gray-100); display:flex; flex-direction:column; gap:0.25rem; }
.sidebar-user { display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:var(--border-radius-sm); text-decoration:none; transition:var(--transition); overflow:hidden; }
.sidebar-user:hover { background:var(--gray-100); }
.user-avatar { width:32px; height:32px; background:var(--brand-primary); color:#fff; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; flex-shrink:0; }
.user-info { overflow:hidden; }
.user-name { display:block; font-size:0.82rem; font-weight:600; color:var(--gray-800); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.user-role { font-size:0.72rem; color:var(--gray-500); }
.logout-btn { display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:var(--border-radius-sm); border:none; background:none; color:var(--gray-500); font-size:0.875rem; font-weight:500; transition:var(--transition); width:100%; overflow:hidden; white-space:nowrap; }
.logout-btn:hover { background:#FEF2F2; color:var(--danger); }
.navbar { position:fixed; top:0; left:var(--sidebar-width); right:0; height:var(--navbar-height); background:#fff; border-bottom:1px solid var(--gray-200); display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; z-index:100; transition:left 0.25s ease; }
.sidebar-collapsed .navbar { left:var(--sidebar-collapsed); }
.navbar-left { display:flex; align-items:center; gap:0.75rem; }
.navbar-title { font-size:1rem; font-weight:700; color:var(--gray-900); }
.mobile-menu-btn { background:none; border:none; color:var(--gray-600); display:flex; }
.navbar-right { display:flex; align-items:center; gap:0.75rem; }
.icon-btn { position:relative; width:36px; height:36px; background:none; border:1px solid var(--gray-200); border-radius:var(--border-radius-sm); display:flex; align-items:center; justify-content:center; color:var(--gray-600); transition:var(--transition); }
.icon-btn:hover { background:var(--gray-100); }
.notif-dot { position:absolute; top:-5px; right:-5px; background:var(--danger); color:#fff; font-size:0.62rem; font-weight:700; width:17px; height:17px; border-radius:999px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
.notif-btn-wrap { position:relative; }
.notif-panel { position:absolute; top:calc(100% + 8px); right:0; width:320px; background:#fff; border:1px solid var(--gray-200); border-radius:var(--border-radius); box-shadow:var(--shadow-xl); z-index:300; overflow:hidden; }
.notif-panel-header { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; border-bottom:1px solid var(--gray-100); font-size:0.875rem; font-weight:600; color:var(--gray-800); }
.notif-mark-read { background:none; border:none; font-size:0.75rem; color:var(--brand-primary); font-weight:500; }
.notif-list { max-height:320px; overflow-y:auto; }
.notif-item { display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 1rem; border-bottom:1px solid var(--gray-100); cursor:pointer; transition:var(--transition); }
.notif-item:hover { background:var(--gray-50); }
.notif-item.unread { background:var(--brand-primary-light); }
.notif-type-dot { width:8px; height:8px; border-radius:999px; flex-shrink:0; margin-top:5px; }
.notif-type-dot.new_match { background:var(--success); }
.notif-type-dot.deadline  { background:var(--warning); }
.notif-type-dot.system    { background:var(--brand-primary); }
.notif-title { font-size:0.82rem; font-weight:600; color:var(--gray-800); }
.notif-msg   { font-size:0.78rem; color:var(--gray-500); margin-top:1px; }
.notif-empty { padding:1.5rem; text-align:center; font-size:0.875rem; color:var(--gray-400); }
.navbar-avatar { width:34px; height:34px; background:var(--brand-primary); color:#fff; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; text-decoration:none; transition:var(--transition); }
.navbar-avatar:hover { opacity:0.85; }
.main-content { margin-left:var(--sidebar-width); flex:1; min-height:100vh; display:flex; flex-direction:column; transition:margin-left 0.25s ease; }
.sidebar-collapsed .main-content { margin-left:var(--sidebar-collapsed); }
.page-content { margin-top:var(--navbar-height); padding:2rem 1.75rem; flex:1; }
.bottom-nav { position:fixed; bottom:0; left:0; right:0; height:64px; background:#fff; border-top:1px solid var(--gray-200); display:flex; align-items:stretch; z-index:200; box-shadow:0 -2px 10px rgb(0 0 0/0.06); }
.bottom-nav-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; color:var(--gray-400); text-decoration:none; font-size:0.65rem; font-weight:500; transition:var(--transition); }
.bottom-nav-item.active { color:var(--brand-primary); }
.bottom-nav-icon { display:flex; }
.mobile-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:199; }
@media(max-width:991px){ .sidebar{ width:var(--sidebar-collapsed); } .navbar{ left:var(--sidebar-collapsed); } .main-content{ margin-left:var(--sidebar-collapsed); } }
@media(max-width:767px){ .sidebar{ transform:translateX(-100%); width:var(--sidebar-width); } .navbar{ left:0; padding:0 1rem; } .main-content{ margin-left:0; } .page-content{ padding:1.25rem 1rem; } .sidebar-collapsed .navbar{ left:0; } .sidebar-collapsed .main-content{ margin-left:0; } }
</style>