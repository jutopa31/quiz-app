import { supabase } from './supabase'

const BUCKET = 'quiz-images'

function getSafeFileName(originalName: string) {
  const ext = originalName.split('.').pop() || 'png'
  const stamp = Date.now()
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${stamp}-${random}.${ext}`
}

export async function uploadQuizImage(file: File, quizId: string) {
  const fileName = getSafeFileName(file.name)
  const path = `${quizId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    })

  if (error) {
    console.error('🔴 Error uploading image:', error)
    throw error
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  return { path: data.path, publicUrl: publicData.publicUrl }
}

function getPathFromPublicUrl(url: string) {
  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const index = parsed.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(parsed.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function deleteQuizImage(imageUrl: string) {
  const path = getPathFromPublicUrl(imageUrl)
  if (!path) return false

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    console.error('🔴 Error deleting image:', error)
    return false
  }
  return true
}
