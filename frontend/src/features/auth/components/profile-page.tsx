import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router'
import { BrandLogo } from '../../../components/brand-logo'
import { ThemeToggle } from '../../../components/theme-toggle'
import { useAuthStore } from '../store/auth-store'
import { deleteAccount, updateProfile } from '../api/auth-api'
import { saveAvatar, uploadImage } from '../../blogs/api/upload-api'

export function ProfilePage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [username, setUsername] = useState(user?.username ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!token || !user) return <Navigate to="/login" replace />

  const submitUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSavingName(true)

    try {
      const response = await updateProfile(token, username)
      setSession(token, { ...user, ...response.data })
      setUsername(response.data.username)
      setMessage('Username updated successfully.')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update username.')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG and WebP images are allowed.')
      return
    }

    setError('')
    setMessage('')
    setIsUploadingAvatar(true)

    try {
      const uploaded = await uploadImage(token, file, 'avatar')
      const response = await saveAvatar(token, uploaded.url)
      setSession(token, { ...user, ...response.user })
      setMessage('Avatar updated successfully.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Avatar upload failed.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This action cannot be undone.')) return

    setError('')
    setIsDeleting(true)
    try {
      await deleteAccount(token)
      clearSession()
      navigate('/', { replace: true })
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete account.')
      setIsDeleting(false)
    }
  }

  const initials = user.username.slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo />
            <span className="font-display text-xl">Inkwell</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="text-sm text-inkwell-gold hover:text-inkwell-light">Back to blog</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Your account</p>
        <h1 className="mt-4 font-display text-5xl">Profile settings.</h1>

        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-inkwell-cream/10 bg-inkwell-900 p-6">
            <div className="flex flex-wrap items-center gap-5">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="size-24 rounded-full object-cover" />
              ) : (
                <div className="grid size-24 place-items-center rounded-full bg-inkwell-gold text-2xl font-bold text-inkwell-950">{initials}</div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="mt-1 text-sm text-inkwell-muted">{user.email}</p>
                <label className="mt-4 inline-block cursor-pointer rounded-xl bg-inkwell-gold px-4 py-2 text-sm font-semibold text-inkwell-950 hover:bg-inkwell-light">
                  {isUploadingAvatar ? 'Uploading…' : 'Change avatar'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} disabled={isUploadingAvatar} className="sr-only" />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={submitUsername} className="rounded-2xl border border-inkwell-cream/10 bg-inkwell-900 p-6">
            <h2 className="text-xl font-semibold">Username</h2>
            <p className="mt-1 text-sm text-inkwell-muted">Use 3–30 letters, numbers or underscores.</p>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-5 w-full rounded-xl border border-inkwell-cream/15 bg-inkwell-950 px-4 py-3 text-sm outline-none focus:border-inkwell-gold" required minLength={3} maxLength={30} />
            <button disabled={isSavingName} className="mt-4 rounded-xl bg-inkwell-gold px-5 py-3 text-sm font-bold text-inkwell-950 disabled:opacity-60">{isSavingName ? 'Saving…' : 'Save username'}</button>
          </form>

          {message && <p className="text-sm text-inkwell-gold">{message}</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="rounded-2xl border border-red-400/20 bg-red-950/20 p-6">
            <h2 className="text-xl font-semibold text-red-200">Delete account</h2>
            <p className="mt-1 text-sm text-red-200/70">This permanently deletes your account and cannot be undone.</p>
            <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="mt-5 rounded-xl border border-red-300/40 px-5 py-3 text-sm font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-60">{isDeleting ? 'Deleting…' : 'Delete my account'}</button>
          </div>
        </div>
      </section>
    </main>
  )
}
