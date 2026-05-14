<script setup lang="ts">
import { useMutation } from '@vue/apollo-composable'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { LOGIN } from '@/graphql/operations'
import { setStoredToken, setStoredUser } from '@/lib/auth-token'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)

const { mutate, loading } = useMutation(LOGIN)

async function submit() {
  errorMessage.value = null
  try {
    const res = await mutate({
      input: { email: email.value, password: password.value },
    })
    const token = res?.data?.login?.accessToken
    const user = res?.data?.login?.user
    if (!token || !user) {
      errorMessage.value = 'Login failed'
      return
    }
    setStoredToken(token)
    setStoredUser({ id: user.id, email: user.email })
    await router.push({ name: 'home' })
  } catch (e: unknown) {
    errorMessage.value =
      e instanceof Error ? e.message : 'Invalid email or password'
  }
}
</script>

<template>
  <main class="auth">
    <div class="auth__card">
      <p class="auth__kicker">Welcome back</p>
      <h1 class="auth__title">Sign in</h1>
      <p class="auth__subtitle">Use the email and password for your account.</p>

      <form class="auth__form" @submit.prevent="submit">
        <label class="label" for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          class="input"
          type="email"
          autocomplete="email"
          required
        />

        <label class="label" for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          required
        />

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </form>

      <p class="auth__footer">
        No account?
        <RouterLink to="/register">Create one</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem 3rem;
  min-height: 60vh;
}

.auth__card {
  width: 100%;
  max-width: 22rem;
  padding: 2rem 1.75rem;
  background: var(--surface-elevated);
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-float);
}

.auth__kicker {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin-bottom: 0.35rem;
}

.auth__title {
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 0.35rem;
}

.auth__subtitle {
  font-size: 0.9rem;
  color: var(--ink-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ink);
  margin-top: 0.5rem;
}

.label:first-of-type {
  margin-top: 0;
}

.input {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  font: inherit;
  font-size: 0.9375rem;
  background: var(--surface);
  color: var(--ink);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.input:hover {
  border-color: rgba(20, 17, 16, 0.24);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-ring);
}

.btn-submit {
  margin-top: 1.1rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: #fff;
  box-shadow: var(--shadow-sm);
  transition: filter 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.form-error {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

.auth__footer {
  margin-top: 1.35rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line);
  font-size: 0.9rem;
  color: var(--ink-muted);
  text-align: center;
}
</style>
