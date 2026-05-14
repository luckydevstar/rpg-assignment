<script setup lang="ts">
import { useMutation, useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BLOGS_QUERY, CREATE_BLOG } from '@/graphql/operations'
import { authTokenRef } from '@/lib/auth-token'

/** Shown if the blogs query fails — reminds devs to run the API. */
const apiHint =
  import.meta.env.VITE_GRAPHQL_HTTP ??
  (import.meta.env.DEV
    ? 'Same-origin /graphql (Vite → localhost:3200) — run: cd backend && bun run start:dev'
    : 'Configure VITE_GRAPHQL_HTTP or serve the API on the same origin')

const newContent = ref('')
const errorMessage = ref<string | null>(null)

const { result, loading, error } = useQuery(BLOGS_QUERY, null, {
  fetchPolicy: 'network-only',
})

const blogs = computed(() => result.value?.blogs ?? [])

const postCount = computed(() => blogs.value.length)

const canPost = computed(() => !!authTokenRef.value)

const { mutate: createBlog, loading: posting } = useMutation(CREATE_BLOG, {
  refetchQueries: [{ query: BLOGS_QUERY }],
})

async function submit() {
  errorMessage.value = null
  const content = newContent.value.trim()
  if (!content) return
  try {
    await createBlog({ content })
    newContent.value = ''
  } catch (e: unknown) {
    errorMessage.value =
      e instanceof Error ? e.message : 'Could not publish. Try signing in again.'
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function avatarLetter(email: string) {
  const c = email?.trim()?.charAt(0)
  return c ? c.toUpperCase() : '?'
}
</script>

<template>
  <main class="blog">
    <div class="blog__hero">
      <p class="blog__kicker">Public feed</p>
      <h1 class="blog__title">What people are sharing</h1>
      <p class="blog__lede">
        Short text-only updates from the whole community. When someone
        publishes, everyone with the app open gets it straight away - no need to
        reload the page.
      </p>
    </div>

    <section v-if="canPost" class="panel panel--compose">
      <div class="panel__head">
        <h2 class="panel__title">Compose</h2>
        <span class="panel__hint">Plain text · live broadcast on publish</span>
      </div>
      <label class="sr-only" for="post-body">Post content</label>
      <textarea
        id="post-body"
        v-model="newContent"
        class="textarea"
        rows="5"
        placeholder="Share something with the community…"
        :disabled="posting"
      />
      <div class="panel__actions">
        <button
          type="button"
          class="btn-primary"
          :disabled="posting || !newContent.trim()"
          @click="submit"
        >
          {{ posting ? 'Publishing…' : 'Publish post' }}
        </button>
      </div>
      <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>
    </section>

    <section v-else class="banner-signin">
      <p>
        <RouterLink to="/login">Sign in</RouterLink> to write posts and join the
        conversation.
      </p>
    </section>

    <p v-if="error" class="banner-api" role="alert">
      <strong>Couldn’t load posts.</strong>
      Is the API running at
      <code>{{ apiHint }}</code>
      ? Open the console (F12) for details.
    </p>

    <section class="feed">
      <div class="feed__head">
        <h2 class="feed__title">All posts</h2>
        <span v-if="!loading && !error" class="feed__count">{{ postCount }}</span>
      </div>

      <div v-if="loading" class="skeleton" aria-busy="true">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="skeleton-card__meta" />
          <div class="skeleton-card__line" />
          <div class="skeleton-card__line skeleton-card__line--short" />
        </div>
      </div>

      <ul v-else-if="blogs.length" class="cards">
        <li v-for="b in blogs" :key="b.id" class="card">
          <div class="card__top">
            <div class="avatar" :aria-label="b.author.email">
              {{ avatarLetter(b.author.email) }}
            </div>
            <div class="card__who">
              <span class="card__author">{{ b.author.email }}</span>
              <time class="card__time" :datetime="b.createdAt">{{
                formatDate(b.createdAt)
              }}</time>
            </div>
          </div>
          <p class="card__body">{{ b.content }}</p>
        </li>
      </ul>

      <p v-else class="feed-empty">
        No posts yet.
        <template v-if="canPost">Be the first to publish above.</template>
        <template v-else
          ><RouterLink to="/register">Create an account</RouterLink> to get
          started.</template
        >
      </p>
    </section>
  </main>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.blog {
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

.blog__hero {
  margin-bottom: 2rem;
}

.blog__kicker {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
  margin-bottom: 0.35rem;
}

.blog__title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.blog__lede {
  font-size: 1rem;
  color: var(--ink-muted);
  max-width: 36ch;
  line-height: 1.6;
}

.panel {
  background: var(--surface-elevated);
  border-radius: var(--radius);
  padding: 1.25rem 1.35rem;
  margin-bottom: 1.75rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--line);
}

.panel--compose {
  border-left: 4px solid var(--accent);
}

.panel__head {
  margin-bottom: 0.85rem;
}

.panel__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
}

.panel__hint {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8125rem;
  color: var(--ink-faint);
}

.textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  font: inherit;
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 7.5rem;
  background: var(--surface);
  color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.textarea::placeholder {
  color: var(--ink-faint);
}

.textarea:hover:not(:disabled) {
  border-color: rgba(20, 17, 16, 0.22);
}

.textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ring);
}

.textarea:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.panel__actions {
  margin-top: 0.9rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: #fff;
  box-shadow: var(--shadow-sm), 0 1px 0 rgba(255, 255, 255, 0.15) inset;
  transition:
    filter 0.15s ease,
    transform 0.1s ease;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.field-error {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

.banner-signin {
  padding: 1rem 1.2rem;
  margin-bottom: 1.75rem;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  border: 1px solid rgba(196, 92, 38, 0.22);
  font-size: 0.9375rem;
  color: var(--ink);
}

.banner-api {
  padding: 1rem 1.15rem;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-sm);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #7f1d1d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.banner-api code {
  font-size: 0.8em;
  word-break: break-all;
}

.feed__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.feed__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.02em;
}

.feed__count {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--surface-elevated);
  border: 1px solid var(--line);
  color: var(--ink-muted);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.skeleton-card {
  padding: 1.15rem;
  border-radius: var(--radius);
  background: var(--surface-elevated);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}

.skeleton-card__meta {
  height: 2.25rem;
  width: 40%;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--page-bg) 0%,
    #e8e4dc 50%,
    var(--page-bg) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  margin-bottom: 0.75rem;
}

.skeleton-card__line {
  height: 0.65rem;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--page-bg) 0%,
    #e8e4dc 50%,
    var(--page-bg) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  margin-bottom: 0.5rem;
}

.skeleton-card__line--short {
  width: 55%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.cards {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--surface-elevated);
  border-radius: var(--radius);
  padding: 1.15rem 1.25rem;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(20, 17, 16, 0.12);
}

.card__top {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.avatar {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, #5c5853 0%, #2d2a28 100%);
}

.card__who {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.card__author {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  word-break: break-all;
}

.card__time {
  font-size: 0.78rem;
  color: var(--ink-faint);
}

.card__body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink);
  white-space: pre-wrap;
}

.feed-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  font-size: 0.95rem;
  color: var(--ink-muted);
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px dashed var(--line-strong);
}
</style>
