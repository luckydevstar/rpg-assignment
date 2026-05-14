<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import LiveBlogToasts from './components/LiveBlogToasts.vue'
import { ME } from './graphql/operations'
import {
  authTokenRef,
  authUserRef,
  needsUserProfile,
  setStoredToken,
  setStoredUser,
  userDisplayLabel,
  userInitialFromEmail,
} from './lib/auth-token'

const isLoggedIn = computed(() => !!authTokenRef.value)

const headerUserLabel = computed(() => {
  const u = authUserRef.value
  return u ? userDisplayLabel(u.email) : ''
})

const headerUserInitial = computed(() => {
  const u = authUserRef.value
  return u ? userInitialFromEmail(u.email) : '?'
})

const headerUserEmail = computed(() => authUserRef.value?.email ?? '')

const { onResult } = useQuery(ME, null, () => ({
  enabled: needsUserProfile,
  fetchPolicy: 'network-only',
}))

onResult((result) => {
  const u = result.data?.me
  if (u) setStoredUser({ id: u.id, email: u.email })
})

function logout() {
  setStoredToken(null)
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header__inner">
        <RouterLink to="/" class="brand">
          <template v-if="isLoggedIn && authUserRef">
            <span class="user-avatar" :title="headerUserEmail">{{
              headerUserInitial
            }}</span>
            <span class="brand__text">
              <span class="brand__name">{{ headerUserLabel }}</span>
              <span class="brand__tag brand__tag--email">{{
                headerUserEmail
              }}</span>
            </span>
          </template>
          <template v-else-if="isLoggedIn">
            <span class="user-avatar user-avatar--pending" aria-hidden="true"
              >…</span
            >
            <span class="brand__text">
              <span class="brand__name">Loading…</span>
              <span class="brand__tag">your account</span>
            </span>
          </template>
          <template v-else>
            <span class="brand__logo" aria-hidden="true">
              <svg
                class="brand__svg"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
                focusable="false"
              >
                <defs>
                  <linearGradient
                    id="brandLogoGrad"
                    x1="0"
                    y1="36"
                    x2="36"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#c45c26" />
                    <stop offset="55%" stop-color="#e8955c" />
                    <stop offset="100%" stop-color="#f4d4b8" />
                  </linearGradient>
                </defs>
                <rect
                  x="4"
                  y="22"
                  width="5.5"
                  height="10"
                  rx="2.75"
                  fill="url(#brandLogoGrad)"
                />
                <rect
                  x="12"
                  y="15"
                  width="5.5"
                  height="17"
                  rx="2.75"
                  fill="url(#brandLogoGrad)"
                  opacity="0.88"
                />
                <rect
                  x="20"
                  y="9"
                  width="5.5"
                  height="23"
                  rx="2.75"
                  fill="url(#brandLogoGrad)"
                  opacity="0.72"
                />
                <rect
                  x="28"
                  y="4"
                  width="5.5"
                  height="28"
                  rx="2.75"
                  fill="url(#brandLogoGrad)"
                  opacity="0.52"
                />
              </svg>
            </span>
            <span class="brand__text">
              <span class="brand__live-feed">LIVE FEED</span>
            </span>
          </template>
        </RouterLink>
        <nav class="nav" aria-label="Main">
          <RouterLink to="/" class="nav__link" active-class="nav__link--active">
            Feed
          </RouterLink>
          <template v-if="isLoggedIn">
            <button type="button" class="btn-text" @click="logout">
              Sign out
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="nav__link nav__link--muted"
              active-class="nav__link--active"
            >
              Sign in
            </RouterLink>
            <RouterLink to="/register" class="nav__cta">
              Register
            </RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <div class="main-wrap">
      <RouterView />
    </div>
    <LiveBlogToasts />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--header-bg);
  color: var(--header-text);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}

.header__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.brand:hover {
  color: inherit;
}

.user-avatar {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, #5c5853 0%, #2d2a28 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.user-avatar--pending {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.brand__logo {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 10px rgba(196, 92, 38, 0.38));
}

.brand__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.brand__live-feed {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.16em;
  color: var(--header-text);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}

.brand__name {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand__tag {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--header-muted);
}

.brand__tag--email {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.6875rem;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 14rem;
}

@media (max-width: 520px) {
  .brand__tag--email {
    max-width: 9rem;
  }
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
}

.nav__link {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--header-text);
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--header-text);
}

.nav__link--muted {
  color: var(--header-muted);
}

.nav__link--muted:hover {
  color: var(--header-text);
}

.nav__link--active:not(.nav__cta) {
  background: rgba(255, 255, 255, 0.12);
  color: var(--header-text);
}

.nav__cta {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}

.nav__cta:hover {
  background: var(--accent-hover);
  color: #fff;
}

.nav__cta.router-link-active {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
}

.btn-text {
  padding: 0.45rem 0.85rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--header-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.btn-text:hover {
  color: var(--header-text);
  background: rgba(255, 255, 255, 0.06);
}

.main-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
